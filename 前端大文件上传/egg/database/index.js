'use strict';

const path = require('path');
const loadDir = require('./../utils').loadDir;

const dirPath = path.join(__dirname, 'chart');
const chart = loadDir(dirPath);


module.exports = {
  ...chart,
};
