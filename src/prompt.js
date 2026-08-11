'use strict';
const { green, red } = require('./colors');

// ── Persistent stdin buffer ───────────────────────────────────────────────────
let _inputBuf = '';

function ask(question) {
  return new Promise(resolve => {
    process.stdout.write(question);

    const idx = _inputBuf.indexOf('\n');
    if (idx !== -1) {
      const line = _inputBuf.slice(0, idx).replace(/\r$/, '').trim();
      _inputBuf  = _inputBuf.slice(idx + 1);
      return resolve(line);
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onData(chunk) {
      _inputBuf += chunk;
      const nl = _inputBuf.indexOf('\n');
      if (nl !== -1) {
        process.stdin.removeListener('data', onData);
        process.stdin.removeListener('end', onEnd);
        process.stdin.pause();
        const line = _inputBuf.slice(0, nl).replace(/\r$/, '').trim();
        _inputBuf  = _inputBuf.slice(nl + 1);
        resolve(line);
      }
    }
    function onEnd() {
      process.stdin.removeListener('data', onData);
      const line = _inputBuf.replace(/\r?\n$/, '').trim();
      _inputBuf  = '';
      resolve(line);
    }

    process.stdin.on('data', onData);
    process.stdin.once('end', onEnd);
  });
}

function closeInput() { process.stdin.destroy(); }

// ── Flutter-doctor style step line — no animation, no in-place redraw,
// so it never looks "stuck" in slower terminals like Windows cmd.exe.
function step(ok, message) {
  const mark = ok ? green('\u2713') : red('\u2717');
  console.log(`  [${mark}]  ${message}`);
}

module.exports = { ask, closeInput, step };
