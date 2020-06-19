const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.balance.get);

  return router;
};
