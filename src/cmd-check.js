'use strict';
const fs   = require('fs');
const path = require('path');
const { step, closeInput } = require('./prompt');
const { cyan, dim }        = require('./colors');
const { readManifest }     = require('./manifest');

module.exports = function cmdCheck() {
  const cwd = process.cwd();
  const m   = readManifest(cwd);

  console.log();

  if (!m) {
    step(false, 'SFML is not linked in this project.');
    console.log(`\n       Run  ${cyan('ma-sfml link')}  to set it up.\n`);
    return closeInput();
  }

  // Verify the recorded files still actually exist — a manifest can go
  // stale if the user deleted .vscode/ manually without using `remove`.
  const missing = (m.configFiles || []).filter(f => !fs.existsSync(path.join(cwd, f)));

  if (missing.length === (m.configFiles || []).length && missing.length > 0) {
    step(false, 'SFML config was removed manually — this project is no longer linked.');
    console.log(`\n       Run  ${cyan('ma-sfml link')}  to set it up again.\n`);
    return closeInput();
  }

  step(true, 'SFML is linked in this project');
  console.log();
  console.log(`       IDE      ${cyan(m.ide === 'vs' ? 'Visual Studio Community' : 'VS Code')}`);
  console.log(`       SFML     ${m.sfmlVersion}  ${dim('(' + m.sfmlPath + ')')}`);
  console.log(`       Linked   ${dim(new Date(m.linkedAt).toLocaleString())}`);
  console.log(`       Config`);
  for (const f of (m.configFiles || [])) {
    const ok = fs.existsSync(path.join(cwd, f));
    console.log(`         ${ok ? cyan(f) : dim(f + '  (missing)')}`);
  }
  if (m.ide === 'vscode' && (m.dlls || []).length) {
    console.log(`       DLLs     ${m.dlls.length} copied to project folder`);
  }
  console.log();

  if (missing.length) {
    step(false, `${missing.length} config file(s) missing — run  ma-sfml link  to repair.`);
    console.log();
  }

  closeInput();
};
