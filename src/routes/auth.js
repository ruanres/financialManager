const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.post('/signup', app.controllers.auth.signup);
  router.post('/signin', app.controllers.auth.signin);

  return router;
};
