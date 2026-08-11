'use strict';
const { blue } = require('./colors');
const { version, author } = require('../package.json');

module.exports = function cmdVersion() {
  console.log(`\n${blue('ma-sfml')} v${version}\nBuilt by ${author}\n`);
};
