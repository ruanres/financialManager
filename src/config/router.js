module.exports = (app) => {
  app.use('/auth', app.routes.auth);
  app.use('*', app.config.passport.authenticate());
  app.use('/users', app.routes.user);
  app.use('/accounts', app.routes.account);
};
