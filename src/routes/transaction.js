const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.transaction.findAll);

  return router;
};
