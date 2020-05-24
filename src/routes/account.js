const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.account.findAll);
  router.get('/:id', app.controllers.account.find);
  router.post('/', app.controllers.account.create);
  router.put('/:id', app.controllers.account.update);
  router.delete('/:id', app.controllers.account.remove);

  return router;
};
