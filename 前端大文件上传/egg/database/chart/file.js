'use strict';

const { DataTypes } = require('sequelize');
const instance = require('../instance');

const file = instance.define('file', {
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  path: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  fileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  chunkSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  start: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isFinish: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

file.sync();

module.exports = file;
