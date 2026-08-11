'use strict';
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { ask, closeInput, step }                           = require('./prompt');
const { fetchReleasesList, downloadZipOnly, extractZip }  = require('./sfml-fetch');
const { detectIde }                                       = require('./detect-ide');
const { performLink }                                     = require('./linker');

const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

module.exports = async function cmdDownload() {
  console.log();

  // 1. Fetch version list
  process.stdout.write('  Fetching available SFML versions...');
  let releases;
  try {
    releases = await fetchReleasesList();
    console.log(' done.\n');
  } catch (e) {
    console.log(' failed.\n  ' + e.message + '\n');
    return closeInput();
  }

  if (!releases.length) {
    console.log('  No releases found. Check your internet connection.\n');
    return closeInput();
  }

  // 2. Show version list
  console.log('  Available versions:\n');
  releases.forEach((r, i) => {
    const label = i === 0 ? `SFML ${r.tag}  (latest)` : `SFML ${r.tag}`;
    console.log(`    ${i + 1}  ${label}`);
  });

  const choice = await ask('\n  Select a version: ');
  const idx    = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= releases.length) {
    console.log('\n  Invalid selection.\n');
    return closeInput();
  }

  const selected = releases[idx];
  console.log();

  // 3. Detect target IDE early — determines which asset variant (MinGW vs
  //    vc17) we download, so the ZIP is directly usable when linking below.
  const cwd = process.cwd();
  const ide = detectIde(cwd);
  const assetIde = (ide === 'vs') ? 'vs' : 'vscode';

  // 4. Download ZIP to Downloads folder (no extraction here)
  if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

  let zipResult;
  try {
    zipResult = await downloadZipOnly(selected, assetIde, DOWNLOADS_DIR);
  } catch (e) {
    console.log('\n  Download failed: ' + e.message + '\n');
    return closeInput();
  }

  step(true, `Saved to ${DOWNLOADS_DIR}`);
  console.log();

  // 5. Ask to link current project
  const link = await ask('  Link to current project? (y/n) ');
  if (link.toLowerCase() !== 'y') {
    console.log('\n  Run  ma-sfml link  in any project folder to use it.\n');
    return closeInput();
  }

  console.log();

  if (ide === 'empty' || ide === 'unknown') {
    console.log('  No C++ project detected in this folder.\n');
    console.log('  Run  ma-sfml link  from inside your project folder.\n');
    return closeInput();
  }

  // 6. Extract to cache
  let sfml;
  try {
    const extracted = await extractZip(zipResult.zipPath);
    sfml = { path: extracted.path, version: extracted.version };
  } catch (e) {
    console.log('\n  ' + e.message + '\n');
    return closeInput();
  }

  console.log();

  // 7. Link (shared helper — same manifest/output behavior as `ma-sfml link`)
  const ideName = ide === 'vs' ? 'Visual Studio Community' : 'VS Code';
  step(true, `IDE detected — ${ideName}`);

  const projectName = path.basename(cwd) || 'My SFML Project';
  try {
    performLink(cwd, ide, sfml, { projectName, createProject: false });
  } catch (e) {
    step(false, e.message);
    console.log();
  }

  closeInput();
};
