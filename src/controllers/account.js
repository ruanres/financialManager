module.exports = (app) => {
  const create = async (req, res, next) => {
    try {
      const account = { ...req.body, user_id: req.user.id };
      const result = await app.services.account.save(account);
      res.status(201).json(result[0]);
    } catch (error) {
      next(error);
    }
  };

  const findAll = async (req, res) => {
    const result = await app.services.account.getAll({ user_id: req.user.id });
    res.status(200).json(result);
  };

  const find = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await app.services.account.get({ id });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await app.services.account.update(id, req.body);
      res.status(200).json(result[0]);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      await app.services.account.remove(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    create, findAll, find, update, remove,
  };
};
