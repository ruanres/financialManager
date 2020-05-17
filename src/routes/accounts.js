module.exports = (app) => {
  const create = async (req, res) => {
    try {
      const result = await app.services.account.save(req.body);
      res.status(201).json(result[0]);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  const findAll = async (req, res) => {
    const result = await app.services.account.getAll();
    res.status(200).json(result);
  };

  const find = async (req, res) => {
    const result = await app.services.account.get(req.params.id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send({ error: 'Account not found' });
    }
  };

  const update = async (req, res) => {
    const result = await app.services.account.update(req.params.id, req.body);
    res.status(200).json(result[0]);
  };

  const remove = async (req, res) => {
    await app.services.account.remove(req.params.id);
    res.status(200).send();
  };

  return {
    create, findAll, find, update, remove,
  };
};
