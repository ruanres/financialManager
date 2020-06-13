const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.transfer.findAll);
  router.get('/:id', app.controllers.transfer.find);
  router.post('/', app.controllers.transfer.create);
  router.put('/:id', app.controllers.transfer.update);

  return router;
};
