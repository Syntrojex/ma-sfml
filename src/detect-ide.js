'use strict';
const fs   = require('fs');
const path = require('path');

// Find .vcxproj path: current dir, then up to 2 levels deep.
// Handles the common VS layout (Solution/ProjectName/ProjectName.vcxproj)
// as well as slightly deeper custom layouts.
function findVcxproj(dir) {
  return searchVcxproj(dir, 2);
}

function searchVcxproj(dir, depth) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return null; }

  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.vcxproj')) return path.join(dir, e.name);
  }
  if (depth <= 0) return null;

  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const found = searchVcxproj(path.join(dir, e.name), depth - 1);
    if (found) return found;
  }
  return null;
}

// Returns: 'vs' | 'vscode' | 'empty' | 'unknown'
function detectIde(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 'unknown';
  }

  const names = entries.map(e => e.name);

  // Visual Studio — .sln, .slnx (newer XML solution format), or a .vcxproj
  // anywhere up to 2 levels deep (covers the standard Solution/Project/ layout
  // and slightly deeper custom layouts). Reuses findVcxproj so detection and
  // actual file-locating logic can never drift out of sync with each other.
  if (names.some(n => n.endsWith('.sln') || n.endsWith('.slnx') || n.endsWith('.vcxproj'))) return 'vs';
  if (findVcxproj(dir)) return 'vs';

  // VS Code — .vscode/ folder exists
  if (names.includes('.vscode')) {
    const vscPath = path.join(dir, '.vscode');
    if (fs.statSync(vscPath).isDirectory()) return 'vscode';
  }

  // Any .cpp file in current dir or src/ → treat as VS Code / generic
  if (names.some(n => n.endsWith('.cpp') || n.endsWith('.h'))) return 'vscode';
  if (names.includes('src')) {
    try {
      const src = fs.readdirSync(path.join(dir, 'src'));
      if (src.some(n => n.endsWith('.cpp'))) return 'vscode';
    } catch {}
  }

  // Truly empty (ignore hidden files like .git)
  const visible = names.filter(n => !n.startsWith('.'));
  if (visible.length === 0) return 'empty';

  return 'unknown';
}

module.exports = { detectIde, findVcxproj };
