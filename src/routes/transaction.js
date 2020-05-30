const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.transaction.findAll);
  router.get('/:id', app.controllers.transaction.find);
  router.post('/', app.controllers.transaction.create);
  router.put('/:id', app.controllers.transaction.update);
  router.delete('/:id', app.controllers.transaction.remove);

  return router;
};
