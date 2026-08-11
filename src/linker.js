'use strict';
const fs   = require('fs');
const path = require('path');
const { step } = require('./prompt');
const { findVcxproj } = require('./detect-ide');
const { writeManifest, readManifest } = require('./manifest');
const linkVscode = require('./ide/vscode');
const linkVs     = require('./ide/vs');

// Shared by `link` and `download` so both commands generate identical,
// correctly-tracked output — no risk of one path forgetting the manifest
// or using a different default project name than the other.
function performLink(cwd, ide, sfml, { projectName, createProject }) {
  const prevManifest = readManifest(cwd);
  const previousDlls = (prevManifest && prevManifest.ide === 'vscode') ? (prevManifest.dlls || []) : [];

  let result;
  if (ide === 'vscode') {
    result = linkVscode(cwd, sfml.path, projectName, previousDlls);
  } else {
    const vcxprojPath = createProject ? null : findVcxproj(cwd);
    result = linkVs(cwd, sfml.path, projectName, { createProject, vcxprojPath });
  }

  step(true, 'Linking complete');
  for (const f of result.files) console.log(`        ${f}`);

  writeManifest(cwd, {
    sfmlPath: sfml.path,
    sfmlVersion: sfml.version,
    projectName,
    ...result.manifest,
  });

  console.log();
  if (ide === 'vscode') {
    console.log('  Open this folder in VS Code.');
    console.log('    Build:  Ctrl + Shift + B');
    console.log('    Run:    F5');
  } else {
    const findSolutionFile = (dir) => {
      try {
        const f = fs.readdirSync(dir).find(n => n.endsWith('.sln') || n.endsWith('.slnx'));
        return f ? path.join(dir, f) : null;
      } catch { return null; }
    };
    const solutionPath = findSolutionFile(cwd) || findSolutionFile(path.dirname(cwd));
    if (solutionPath) {
      console.log(`  Open  ${path.basename(solutionPath)}  in Visual Studio.`);
    } else {
      console.log('  Open your .sln / .slnx file in Visual Studio.');
    }
    console.log('    Build:  Ctrl + Shift + B');
  }
  console.log();
}

module.exports = { performLink };
