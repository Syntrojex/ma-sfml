'use strict';
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CACHE_DIR     = path.join(os.homedir(), '.ma-sfml-cache');
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

const COMMON_PATHS = [
  'C:\\SFML',
  'C:\\Libraries',
  'C:\\dev',
  'C:\\libs',
  'C:\\Program Files\\SFML',
  'C:\\Program Files (x86)\\SFML',
];

// MinGW packages ship libsfml-*.a; MSVC (vc17) packages ship sfml-*.lib.
// Checking the actual file extension — not just folder presence — stops
// ma-sfml from picking an SFML install built for the wrong compiler
// (which would fail to link with a confusing "unresolved external" error).
function libExtensionMatches(libDir, ide) {
  let entries;
  try { entries = fs.readdirSync(libDir); } catch { return false; }
  const wantExt = ide === 'vs' ? '.lib' : '.a';
  return entries.some(f => f.toLowerCase().endsWith(wantExt));
}

// A valid SFML folder has include/SFML/ and a lib/ or bin/ folder.
// When `ide` is given, also verifies the lib files match that compiler.
function isValidSfmlDir(dir, ide) {
  if (!fs.existsSync(path.join(dir, 'include', 'SFML'))) return false;
  const libDir = path.join(dir, 'lib');
  const hasLib = fs.existsSync(libDir);
  const hasBin = fs.existsSync(path.join(dir, 'bin'));
  if (!hasLib && !hasBin) return false;
  if (ide && hasLib && !libExtensionMatches(libDir, ide)) return false;
  return true;
}

function versionFromName(name) {
  const m = name.match(/SFML[- ]?(\d+\.\d+(?:\.\d+)?)/i);
  return m ? m[1] : 'unknown';
}

// Proper numeric version comparison — alphabetical sort breaks once any
// version segment reaches double digits (e.g. "2.10.0" would incorrectly
// sort before "2.6.2" as plain strings).
function compareVersions(a, b) {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// Does this asset/zip filename match the requested IDE's compiler variant?
function nameMatchesIde(name, ide) {
  if (ide === 'vs') return /vc\d+/i.test(name) || /windows-vc/i.test(name);
  return /mingw/i.test(name) || /gcc/i.test(name);
}

// Scan a base dir for the first sfml-* subfolder that looks valid for `ide`
function scanDir(base, ide) {
  if (!fs.existsSync(base)) return null;
  try {
    const candidates = [];
    for (const e of fs.readdirSync(base)) {
      if (!/^sfml/i.test(e)) continue;
      const full = path.join(base, e);
      if (fs.statSync(full).isDirectory() && isValidSfmlDir(full, ide)) {
        candidates.push({ type: 'extracted', path: full, version: versionFromName(e) });
      }
    }
    if (!candidates.length) return null;
    // Prefer the highest version if multiple valid installs exist
    candidates.sort((a, b) => compareVersions(b.version, a.version));
    return candidates[0];
  } catch {
    return null;
  }
}

// Look for an SFML zip in Downloads that matches the requested IDE's compiler
function findZipInDownloads(ide) {
  if (!fs.existsSync(DOWNLOADS_DIR)) return null;
  try {
    const files = fs.readdirSync(DOWNLOADS_DIR)
      .filter(f => /^SFML.*windows.*\.zip$/i.test(f) && nameMatchesIde(f, ide));
    if (!files.length) return null;

    files.sort((a, b) => compareVersions(versionFromName(b), versionFromName(a)));
    const name = files[0];
    return { type: 'zip', path: path.join(DOWNLOADS_DIR, name), version: versionFromName(name) };
  } catch {
    return null;
  }
}

// `ide`: 'vs' | 'vscode' (or undefined to accept either — used by generic scans)
function findSfml(ide) {
  const cached = scanDir(CACHE_DIR, ide);
  if (cached) return cached;

  const zip = findZipInDownloads(ide);
  if (zip) return zip;

  for (const base of COMMON_PATHS) {
    if (isValidSfmlDir(base, ide)) {
      return { type: 'extracted', path: base, version: versionFromName(path.basename(base)) };
    }
    const found = scanDir(base, ide);
    if (found) return found;
  }

  return { type: 'none' };
}

module.exports = { findSfml, CACHE_DIR, DOWNLOADS_DIR, isValidSfmlDir, compareVersions };
