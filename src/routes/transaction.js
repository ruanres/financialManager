const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.transaction.findAll);
  router.post('/', app.controllers.transaction.create);

  return router;
};
