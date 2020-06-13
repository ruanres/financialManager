const express = require('express');

module.exports = (app) => {
  const router = express.Router();

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

  return router;
};
