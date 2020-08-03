'use strict';

module.exports = () => {
  return async function(ctx, next) {
    try {
      await next();
      ctx.body = {
        status: 200,
        result: ctx.body,
        message: 'ok',
      };
    } catch (e) {
      ctx.body = {
        status: 500,
        result: '',
        message: e,
      };
    }
  };
};
