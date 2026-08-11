#!/usr/bin/env node
'use strict';

const arg = process.argv[2];

// No arguments → run link (same as ma-sfml link)
if (!arg || arg === 'link') {
  require('../src/cmd-link')().catch(err => {
    console.error('\n  Error:', err.message, '\n');
    process.exit(1);
  });
} else {
  switch (arg) {
    case '-h':
    case '--help':
      require('../src/help')();
      break;
    case '-v':
    case '--version':
      require('../src/cmd-version')();
      break;
    case 'download':
      require('../src/cmd-download')().catch(err => {
        console.error('\n  Error:', err.message, '\n');
        process.exit(1);
      });
      break;
    case 'remove':
      require('../src/cmd-remove')().catch(err => {
        console.error('\n  Error:', err.message, '\n');
        process.exit(1);
      });
      break;
    case 'check':
      require('../src/cmd-check')();
      break;
    default:
      console.log(`\nUnknown command: ${arg}`);
      console.log(`Run  ma-sfml --help  for available commands.\n`);
      process.exit(1);
  }
}
