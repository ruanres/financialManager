const express = require('express');
const ForbiddenError = require('../error/ForbiddenError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    try {
      const account = await await app.services.account.get({ id: req.params.id });
      if (account.user_id !== req.user.id) {
        next(new ForbiddenError());
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  });

  router.get('/', app.controllers.account.findAll);
  router.get('/:id', app.controllers.account.find);
  router.post('/', app.controllers.account.create);
  router.put('/:id', app.controllers.account.update);
  router.delete('/:id', app.controllers.account.remove);

  return router;
};
