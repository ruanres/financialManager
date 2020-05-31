const express = require('express');
const ForbiddenError = require('../error/ForbiddenError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    try {
      const transactions = await await app.services.transaction.getAll(req.user.id, { 'transactions.id': req.params.id });
      if (transactions.length === 0) {
        next(new ForbiddenError());
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  });

  router.get('/', app.controllers.transaction.findAll);
  router.get('/:id', app.controllers.transaction.find);
  router.post('/', app.controllers.transaction.create);
  router.put('/:id', app.controllers.transaction.update);
  router.delete('/:id', app.controllers.transaction.remove);

  return router;
};
