const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.transfer.findAll);
  router.post('/', app.controllers.transfer.create);

  return router;
};
