module.exports = (app) => {
  app.route('/auth/signin')
    .post(app.controllers.auth.signin);

  app.route('/auth/signup')
    .post(app.controllers.users.create);

  app.route('/users')
    .all(app.config.passport.authenticate())
    .get(app.controllers.users.findAll)
    .post(app.controllers.users.create);

  app.route('/accounts')
    .all(app.config.passport.authenticate())
    .get(app.controllers.accounts.findAll)
    .post(app.controllers.accounts.create);

  app.route('/accounts/:id')
    .all(app.config.passport.authenticate())
    .get(app.controllers.accounts.find)
    .put(app.controllers.accounts.update)
    .delete(app.controllers.accounts.remove);
};
