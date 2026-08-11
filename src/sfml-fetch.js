'use strict';
const https    = require('https');
const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const { spawn }  = require('child_process');
const { step }   = require('./prompt');
const { CACHE_DIR } = require('./find-sfml');

const RELEASES_URL = 'https://api.github.com/repos/SFML/SFML/releases?per_page=15';

// ── HTTP(S) get with redirect following ──────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ma-sfml' } }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location)
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      resolve(res);
    }).on('error', reject);
  });
}

function readJson(res) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    res.on('data', d => chunks.push(d));
    res.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { reject(new Error('Could not parse GitHub response.')); }
    });
  });
}

// ── Fetch list of recent SFML releases that have Windows assets ───────────────
async function fetchReleasesList() {
  const res  = await httpsGet(RELEASES_URL);
  const data = await readJson(res);
  if (!Array.isArray(data)) {
    const msg = data?.message || 'Unexpected GitHub API response.';
    throw new Error(msg.includes('rate limit') ? 'GitHub API rate limit hit. Try again in a minute.' : msg);
  }

  const result = [];
  for (const r of data) {
    if (r.prerelease || r.draft) continue;
    const tag    = r.tag_name.replace(/^v/, '');
    const hasWin = (r.assets || []).some(a => /windows/i.test(a.name) && a.name.endsWith('.zip'));
    if (hasWin) result.push({ tag, release: r });
    if (result.length >= 8) break;
  }
  return result;
}

// ── Pick the right Windows ZIP asset for the given IDE ───────────────────────
function pickAsset(assets, ide) {
  const win = assets.filter(a => /windows/i.test(a.name) && a.name.endsWith('.zip'));
  if (ide === 'vs')
    return win.find(a => /vc17.*64/i.test(a.name))
        || win.find(a => /vc.*64/i.test(a.name))
        || win[0];
  // vscode / MinGW 64-bit
  return win.find(a => /mingw.*64/i.test(a.name))
      || win.find(a => /gcc.*64/i.test(a.name))
      || win[0];
}

// ── Download (no in-place redrawn progress bar — just a start line + a
// single done step, avoids the "stuck/laggy" feel some terminals show
// when repainting a bar with carriage returns) ───────────────────────────────
function downloadFile(url, destFile, label) {
  return new Promise((resolve, reject) => {
    console.log(`  Downloading ${label} ...`);

    httpsGet(url).then(res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location)
        return downloadFile(res.headers.location, destFile, label).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

      const out = fs.createWriteStream(destFile);
      res.pipe(out);
      out.on('finish', resolve);
      out.on('error',  err => { out.destroy(); reject(err); });
      res.on('error',  err => { out.destroy(); reject(err); });
    }).catch(reject);
  });
}

// ── Extract ZIP to CACHE_DIR ──────────────────────────────────────────────────
// windowsHide + -WindowStyle Hidden stop any CMD window flash or taskbar entry.
function extractZip(zipPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    console.log('  Extracting SFML ...');

    const ps = spawn('powershell', [
      '-NoProfile',
      '-WindowStyle', 'Hidden',
      '-Command',
      `Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${CACHE_DIR}'`,
    ], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });

    ps.on('close', code => {
      if (code !== 0) {
        step(false, 'Extraction failed');
        return reject(new Error(`PowerShell exited with code ${code}. Try running as administrator.`));
      }

      try {
        const entries = fs.readdirSync(CACHE_DIR);
        const sfmlDir = entries.find(e => /^sfml/i.test(e));
        if (!sfmlDir) return reject(new Error('Extraction succeeded but no SFML folder was found.'));
        const m = sfmlDir.match(/SFML[- ]?(\d+\.\d+(?:\.\d+)?)/i);
        resolve({ path: path.join(CACHE_DIR, sfmlDir), version: m ? m[1] : sfmlDir });
      } catch (e) {
        reject(e);
      }
    });

    ps.on('error', reject);
  });
}

// ── Download + extract (link command) ────────────────────────────────────────
async function downloadAndInstall(releaseInfo, ide) {
  const asset = pickAsset(releaseInfo.release.assets, ide);
  if (!asset) throw new Error('No suitable Windows asset found for this release.');

  const sizeMB  = (asset.size / 1024 / 1024).toFixed(1);
  const label   = `${asset.name} (${sizeMB} MB)`;
  const tmpFile = path.join(os.tmpdir(), asset.name);

  await downloadFile(asset.browser_download_url, tmpFile, label);
  step(true, `Downloaded ${asset.name}`);

  const result = await extractZip(tmpFile);
  step(true, 'Extraction complete');

  try { fs.unlinkSync(tmpFile); } catch {}
  return { path: result.path, version: result.version };
}

// ── Download ZIP only (download command — no extraction) ──────────────────────
async function downloadZipOnly(releaseInfo, ide, destDir) {
  const asset = pickAsset(releaseInfo.release.assets, ide);
  if (!asset) throw new Error('No suitable Windows asset found for this release.');

  const sizeMB  = (asset.size / 1024 / 1024).toFixed(1);
  const label   = `${asset.name} (${sizeMB} MB)`;
  const destFile = path.join(destDir, asset.name);

  await downloadFile(asset.browser_download_url, destFile, label);
  step(true, `Downloaded ${asset.name}`);

  return { zipPath: destFile, assetName: asset.name };
}

module.exports = { fetchReleasesList, pickAsset, downloadAndInstall, downloadZipOnly, extractZip };
