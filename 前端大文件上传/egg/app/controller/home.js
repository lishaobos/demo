'use strict';

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const Controller = require('egg').Controller;
const Multiparty = require('multiparty');
const basePath = './upload-file';
const database = require('./../../database');


class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async createUploadTask() {
    const { ctx } = this;

    const { name: fileName, type, chunkSize, fileSize } = ctx.request.body;
    const name = `${fileName}-${Date.now()}`;
    const dirPath = `${basePath}/${name}`;

    await fsPromises.mkdir(dirPath);
    await fsPromises.mkdir(`${dirPath}/tasks`);

    const taskMes = await database.file.create({
      name,
      type,
      chunkSize,
      fileSize,
      path: dirPath,
    });

    const createChildTask = parentMes => {
      const { id, name, type, fileSize, chunkSize } = parentMes;
      let index = 0;
      let start = 0;
      let end = chunkSize;

      if (chunkSize >= fileSize) {
        return [{
          parentId: id,
          name,
          type,
          fileSize: chunkSize,
          index,
          start,
        }];
      }

      const data = [];
      while (end <= fileSize) {
        data.push({
          parentId: id,
          name,
          type,
          fileSize: chunkSize,
          index,
          start,
        });
        index++;
        start = index * chunkSize;
        end = start + chunkSize;
      }

      return data;
    };

    const children = await database.file.bulkCreate(createChildTask(taskMes));

    ctx.body = {
      ...taskMes.dataValues,
      children,
    };
  }

  async uploadChunk() {
    const { ctx } = this;
    const { req } = ctx;

    const parse = () => {
      return new Promise((resolve, reject) => {
        const form = new Multiparty.Form();
        form.parse(req, async (err, fields, files) => {
          try {
            const id = fields.id[0];
            const file = files.file[0];
            const name = fields.name[0];
            const index = fields.index[0];
            const type = fields.type[0];

            const dirPath = `${basePath}/${name}/tasks`;
            const filePath = `${dirPath}/${index}.${type}`;

            await fsPromises.rename(file.path, filePath);
            const res = await database.file.update(
              { isFinish: 1 },
              {
                where: { id },
              }
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    try {
      const res = await parse();
      ctx.body = res;
    } catch (e) {
      throw e;
    }
  }

  async mergeFile() {
    const { ctx } = this;
    const { id } = ctx.params;

    // 先确定是否存在这个任务
    const task = await database.file.findOne({
      where: { id },
    });

    if (!task) return;

    const { name, type } = task.dataValues;
    const dirPath = `${basePath}/${name}/tasks`;
    let files = await fsPromises.readdir(dirPath);
    files = files.sort((c, n) => {
      const cIndex = c.lastIndexOf('.');
      const nIndex = n.lastIndexOf('.');
      return c.slice(0, cIndex) - n.slice(0, nIndex);
    });

    const indexFilePath = `${basePath}/${name}/index.${type}`;
    await fsPromises.writeFile(indexFilePath);

    const writeStream = fs.createWriteStream(indexFilePath);
    let index = 0;
    const mkFile = files => {
      return new Promise(resolve => {
        const merge = () => {
          if (index >= files.length) return;

          const readStream = fs.createReadStream(path.join(dirPath, files[index]));
          readStream.pipe(writeStream, { end: false });

          if (index === files.length - 1) {
            readStream.on('end', () => {
              writeStream.end();
              resolve();
            });
            return;
          }

          readStream.on('end', () => {
            index++;
            merge(files);
          });
        };

        merge();
      });

    };

    await mkFile(files);
    ctx.body = 200;
    this.removeDir(dirPath);
  }

  async removeDir(dirPath) {
    const files = await fsPromises.readdir(dirPath);
    const arr = [];
    for (const fileNmae of files) {
      const filePath = path.join(dirPath, fileNmae);
      arr.push(fsPromises.unlink(filePath));
    }
    await Promise.all(arr);
    await fsPromises.rmdir(dirPath);
  }

}


module.exports = HomeController;
