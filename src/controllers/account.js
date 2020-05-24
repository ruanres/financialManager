module.exports = (app) => {
  const create = async (req, res, next) => {
    try {
      const result = await app.services.account.save(req.body);
      res.status(201).json(result[0]);
    } catch (error) {
      next(error);
    }
  };

  const findAll = async (req, res) => {
    const result = await app.services.account.getAll();
    res.status(200).json(result);
  };

  const find = async (req, res, next) => {
    try {
      const result = await app.services.account.get(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res) => {
    const result = await app.services.account.update(req.params.id, req.body);
    res.status(200).json(result[0]);
  };

  const remove = async (req, res) => {
    await app.services.account.remove(req.params.id);
    res.status(204).send();
  };

  return {
    create, findAll, find, update, remove,
  };
};
