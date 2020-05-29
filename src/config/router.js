const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auth);

  const protectedRouter = express.Router();
  protectedRouter.use('/users', app.routes.user);
  protectedRouter.use('/accounts', app.routes.account);
  protectedRouter.use('/transactions', app.routes.transaction);
  app.use('/', app.config.passport.authenticate(), protectedRouter);
};
