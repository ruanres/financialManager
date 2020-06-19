const express = require('express');
const ForbiddenError = require('../error/ForbiddenError');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.balance.get);

  return router;
};
