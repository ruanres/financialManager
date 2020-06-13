const express = require('express');
const ForbiddenError = require('../error/ForbiddenError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    try {
      const transfer = await await app.services.transfer.getOne({ id: req.params.id });
      if (transfer.user_id !== req.user.id) {
        next(new ForbiddenError());
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  });

  const validate = async (req, res, next) => {
    try {
      await app.services.transfer.validate(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  router.get('/', app.controllers.transfer.findAll);
  router.get('/:id', app.controllers.transfer.find);
  router.post('/', validate, app.controllers.transfer.create);
  router.put('/:id', validate, app.controllers.transfer.update);
  router.delete('/:id', app.controllers.transfer.remove);

  return router;
};
