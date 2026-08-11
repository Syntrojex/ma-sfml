'use strict';
const fs   = require('fs');
const path = require('path');

const MANIFEST_NAME = '.ma-sfml.json';

function manifestPath(projectDir) {
  return path.join(projectDir, MANIFEST_NAME);
}

// Write manifest recording exactly what ma-sfml generated, so `check` and
// `remove` never have to guess — no regex scraping of JSON/XML, no stale
// assumptions if the user renamed things.
function writeManifest(projectDir, data) {
  const manifest = {
    tool: 'ma-sfml',
    linkedAt: new Date().toISOString(),
    ...data,
  };
  fs.writeFileSync(manifestPath(projectDir), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

function readManifest(projectDir) {
  const p = manifestPath(projectDir);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function deleteManifest(projectDir) {
  const p = manifestPath(projectDir);
  try { fs.unlinkSync(p); } catch {}
}

module.exports = { MANIFEST_NAME, manifestPath, writeManifest, readManifest, deleteManifest };
