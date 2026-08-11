'use strict';
const fs   = require('fs');
const path = require('path');
const { ask, closeInput, step } = require('./prompt');
const { readManifest, deleteManifest } = require('./manifest');

// Fallback file list used only when no manifest exists (e.g. project was
// linked with an older version of ma-sfml, or the manifest was deleted by hand).
const FALLBACK_VSCODE_FILES = [
  '.vscode/tasks.json',
  '.vscode/launch.json',
  '.vscode/c_cpp_properties.json',
];

function stripVcxprojImport(vcxprojPath) {
  if (!vcxprojPath || !fs.existsSync(vcxprojPath)) return false;
  try {
    let xml = fs.readFileSync(vcxprojPath, 'utf8');
    const before = xml;
    xml = xml.replace(/\s*<!--[^>]*ma-sfml[^>]*-->\s*\n?/g, '\n');
    xml = xml.replace(/\s*<Import[^>]*ma-sfml\.props[^>]*\/>\s*\n?/g, '\n');
    if (xml !== before) {
      fs.writeFileSync(vcxprojPath, xml, 'utf8');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

module.exports = async function cmdRemove() {
  const cwd     = process.cwd();
  const m       = readManifest(cwd);

  let filesToRemove = [];   // { display, full }
  let vcxprojPath   = null;

  if (m) {
    for (const f of (m.configFiles || [])) {
      const full = path.join(cwd, f);
      if (fs.existsSync(full)) filesToRemove.push({ display: f, full });
    }
    if (m.ide === 'vscode') {
      for (const dll of (m.dlls || [])) {
        const full = path.join(cwd, dll);
        if (fs.existsSync(full)) filesToRemove.push({ display: dll, full });
      }
    }
    vcxprojPath = m.vcxprojPath || null;

  } else {
    // No manifest — fall back to a best-effort scan
    for (const f of FALLBACK_VSCODE_FILES) {
      const full = path.join(cwd, f);
      if (fs.existsSync(full)) filesToRemove.push({ display: f, full });
    }
    const propsHere = path.join(cwd, 'ma-sfml.props');
    if (fs.existsSync(propsHere)) filesToRemove.push({ display: 'ma-sfml.props', full: propsHere });
  }

  if (!filesToRemove.length) {
    console.log('\n  No SFML config files found in the current directory.\n');
    return closeInput();
  }

  console.log();
  step(true, `Scanned project — ${filesToRemove.length} file(s) to remove`);

  const vcxAlreadyListed = vcxprojPath && filesToRemove.some(f => path.resolve(f.full) === path.resolve(vcxprojPath));

  console.log('\n  The following files will be removed:\n');
  for (const f of filesToRemove) console.log(`    ${f.display}`);
  if (vcxprojPath && !vcxAlreadyListed) {
    console.log(`    ${path.relative(cwd, vcxprojPath).replace(/\\/g, '/')}  (SFML import will be removed)`);
  }
  console.log('\n  Your source code and SFML installation will not be touched.');

  const ans = await ask('\n  Proceed? (y/n) ');
  if (ans.toLowerCase() !== 'y') {
    console.log('\n  Aborted.\n');
    return closeInput();
  }

  console.log();

  for (const f of filesToRemove) {
    try {
      fs.unlinkSync(f.full);
      step(true, `Removed  ${f.display}`);

      const dir = path.dirname(f.full);
      if (dir !== cwd) {
        try { if (!fs.readdirSync(dir).length) fs.rmdirSync(dir); } catch {}
      }
    } catch (e) {
      step(false, `Could not remove ${f.display} — ${e.message}`);
    }
  }

  if (vcxprojPath) {
    const alreadyDeleted = filesToRemove.some(f => path.resolve(f.full) === path.resolve(vcxprojPath));
    if (!alreadyDeleted) {
      const cleaned = stripVcxprojImport(vcxprojPath);
      step(cleaned, cleaned
        ? `Cleaned  ${path.relative(cwd, vcxprojPath).replace(/\\/g, '/')}`
        : `Could not find SFML import in  ${path.relative(cwd, vcxprojPath).replace(/\\/g, '/')}`);
    }
  }

  deleteManifest(cwd);

  console.log('\n  Done.\n');
  closeInput();
};
