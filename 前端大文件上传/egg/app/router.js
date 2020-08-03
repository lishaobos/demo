'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/upload/task', controller.home.createUploadTask);
  router.post('/upload/chunk', controller.home.uploadChunk);
  router.post('/mergeFile/:id', controller.home.mergeFile);
};
