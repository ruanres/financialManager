const consign = require('consign');
const app = require('express')();
const db = require('./config/db');
const errorHandler = require('./error/ErrorHandler');

app.db = db;

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./controllers')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.use(errorHandler);

module.exports = app;
