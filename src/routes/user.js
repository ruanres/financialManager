const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', app.controllers.user.findAll);
  router.post('/', app.controllers.user.create);

  return router;
};
