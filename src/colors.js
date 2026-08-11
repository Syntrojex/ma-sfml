'use strict';
// ANSI colors — auto-disabled when not a TTY or NO_COLOR is set
const on = process.stdout.isTTY && process.env.NO_COLOR === undefined;
const c  = (code, s) => on ? `\x1b[${code}m${s}\x1b[0m` : s;

module.exports = {
  blue:   s => c('94', s),   // bright blue   — package name
  cyan:   s => c('96', s),   // bright cyan   — commands, flags
  yellow: s => c('93', s),   // bright yellow — section headings (USAGE/COMMANDS/FLAGS/EXAMPLES)
  green:  s => c('92', s),   // bright green  — success ✓
  red:    s => c('91', s),   // bright red    — errors ✗
  dim:    s => c('2',  s),   // dim           — secondary text
  bold:   s => c('1',  s),
};
