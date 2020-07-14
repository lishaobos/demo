'use strict';

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const Controller = require('egg').Controller;
const Multiparty = require('multiparty');
const basePath = './upload-file/';

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async upload() {
    const { ctx } = this;
    const { req } = ctx;

    const parse = () => {
      return new Promise((resolve, reject) => {
        const form = new Multiparty.Form();
        form.parse(req, async (err, fields, files) => {
          try {
            const file = files.file[0];
            const fileName = fields.name[0];
            const index = fields.index[0];
            const type = fields.type[0];

            const dirPath = `${basePath}${fileName}`;
            const filePath = `${dirPath}/${index}.${type}`;

            try {
              fs.statSync(dirPath);
            } catch (e) {
              await fsPromises.mkdir(dirPath);
            }

            await fsPromises.rename(file.path, filePath);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    try {
      await parse();
    } catch (e) {
      throw e;
    }
    ctx.body = 200;
  }

  async mergeFile() {
    const { ctx } = this;

    const dirPath = `${basePath}9H9fHGOIx-dVr-1582560601611-1594708972688`;
    let files = await fsPromises.readdir(dirPath);
    files = files.sort((c, n) => {
      const cIndex = c.lastIndexOf('.');
      const nIndex = n.lastIndexOf('.');
      return c.slice(0, cIndex) - n.slice(0, nIndex);
    });

    const indexFilePath = path.join(dirPath, 'index.mp4');
    await fsPromises.writeFile(indexFilePath);

    const writeStream = fs.createWriteStream(indexFilePath);
    let index = 0;
    const merge = async files => {
      if (index >= files.length) return;

      const readStream = fs.createReadStream(path.join(dirPath, files[index]));
      readStream.pipe(writeStream, { end: false });

      if (index === files.length - 1) {
        readStream.on('end', () => {
          writeStream.end();
        });
        return;
      }

      readStream.on('end', () => {
        index++;
        merge(files);
      });
    };

    await merge(files);
    ctx.body = 200;
  }
}

module.exports = HomeController;
