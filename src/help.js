'use strict';
const { blue, cyan, yellow } = require('./colors');

module.exports = function help() {
  const h = s => yellow(s);
  console.log(`
${blue('ma-sfml')}
SFML setup and linking tool for C++ developers on Windows.
Auto-detects your IDE, finds SFML on your PC otherwise downloads your
choice version, and links everything.

${h('USAGE')}
  ma-sfml <command>

${h('COMMANDS')}
  ${cyan('link')}            Auto-detect your IDE, download SFML if it's not
                    already on your PC, and link it to this project
  ${cyan('download')}        Download a specific SFML version
  ${cyan('remove')}          Remove SFML config files from current project
  ${cyan('check')}           Check if SFML is linked in current project

${h('FLAGS')}
  ${cyan('-h, --help')}      Show this help message
  ${cyan('-v, --version')}   Show version information

${h('EXAMPLES')}
  ma-sfml link
  ma-sfml download
  ma-sfml remove
  ma-sfml check
`);
};
