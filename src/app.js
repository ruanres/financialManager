const consign = require('consign');
const app = require('express')();
const db = require('./config/db');

app.db = db;

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./controllers')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.use((err, req, res, next) => {
  const { name, message } = err;
  switch (name) {
    case 'ValidationError':
      res.status(400).send({ error: message });
      break;
    case 'AuthorizationError':
      res.status(401).send({ error: message });
      break;
    case 'NotFoundError':
      res.status(404).send({ error: message });
      break;
    default:
      res.status(500).send(err);
  }
  next(err);
});

module.exports = app;
