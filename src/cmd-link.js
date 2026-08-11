'use strict';
const path = require('path');
const { ask, closeInput, step }                 = require('./prompt');
const { detectIde }                             = require('./detect-ide');
const { findSfml }                              = require('./find-sfml');
const { fetchReleasesList, downloadAndInstall, extractZip } = require('./sfml-fetch');
const { performLink }                           = require('./linker');

// ── Show numbered version list, return chosen release ────────────────────────
async function promptVersionSelect() {
  process.stdout.write('  Fetching available SFML versions...');
  let releases;
  try {
    releases = await fetchReleasesList();
    console.log(' done.\n');
  } catch (e) {
    console.log(' failed.\n  ' + e.message + '\n');
    return null;
  }

  if (!releases.length) {
    console.log('  No releases found. Check your internet connection.\n');
    return null;
  }

  console.log('  Available versions:\n');
  releases.forEach((r, i) => {
    const label = i === 0 ? `SFML ${r.tag}  (latest)` : `SFML ${r.tag}`;
    console.log(`    ${i + 1}  ${label}`);
  });

  const choice = await ask('\n  Select a version: ');
  const idx    = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= releases.length) {
    console.log('\n  Invalid selection.\n');
    return null;
  }

  return releases[idx];
}

// ── Main ─────────────────────────────────────────────────────────────────────
module.exports = async function cmdLink() {
  const cwd = process.cwd();
  console.log();

  // 1. IDE detection
  let ide           = detectIde(cwd);
  let projectName   = path.basename(cwd) || 'My SFML Project';
  let createProject = false;

  if (ide === 'empty') {
    console.log('  This folder is empty.\n');

    const create = await ask('  Create a new SFML project here? (y/n) ');
    if (create.toLowerCase() !== 'y') {
      console.log('\n  Aborted.\n');
      return closeInput();
    }

    console.log('\n  Choose an IDE:');
    console.log('    1  VS Code');
    console.log('    2  Visual Studio Community');

    const ideChoice = await ask('\n  > ');
    ide = ideChoice.trim() === '2' ? 'vs' : 'vscode';

    projectName = 'My SFML Project';
    const nameInput = await ask(`\n  Project name (leave blank for "${projectName}"): `);
    if (nameInput.trim()) projectName = nameInput.trim();

    createProject = true;
    console.log();

  } else if (ide === 'unknown') {
    console.log('  No C++ project detected in this folder.\n');
    console.log('  Open your project folder first, then run  ma-sfml link.\n');
    return closeInput();
  }

  // 2. Find or install SFML (compiler-matched to the detected IDE)
  const existing = findSfml(ide);
  let sfml;

  if (existing.type !== 'none') {
    step(true, `SFML ${existing.version} ready`);
    if (existing.type === 'zip') {
      console.log();
      try {
        const extracted = await extractZip(existing.path);
        sfml = { path: extracted.path, version: extracted.version };
      } catch (e) {
        console.log('  ' + e.message + '\n');
        return closeInput();
      }
      console.log();
    } else {
      sfml = { path: existing.path, version: existing.version };
    }

  } else {
    console.log();
    const selected = await promptVersionSelect();
    if (!selected) return closeInput();

    console.log();
    try {
      sfml = await downloadAndInstall(selected, ide);
    } catch (e) {
      console.log('\n  ' + e.message + '\n');
      return closeInput();
    }

    console.log();
    step(true, `SFML ${sfml.version} installed`);
  }

  // 3. IDE status
  const ideName = ide === 'vs' ? 'Visual Studio Community' : 'VS Code';
  step(true, `IDE detected — ${ideName}`);

  // 4. Link (shared helper — handles files + manifest + usage hints)
  try {
    performLink(cwd, ide, sfml, { projectName, createProject });
  } catch (e) {
    step(false, e.message);
    console.log();
  }

  closeInput();
};
