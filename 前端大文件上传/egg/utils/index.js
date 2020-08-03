'use strict';

const path = require('path');
const fs = require('fs');

exports.loadDir = (dirPath, fileSuffix = '.js') => {
  const module = {};
  const files = fs.readdirSync(dirPath);
  for (const fileName of files) {
    const name = path.basename(fileName, fileSuffix);
    const load = () => require(`${dirPath}/${fileName}`);
    module.__defineGetter__(name, load);
  }
  return module;
};
