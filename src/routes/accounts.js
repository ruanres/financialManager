module.exports = (app) => {
  const create = async (req, res) => {
    try {
      const result = await app.services.account.save(req.body);
      res.status(201).json(result[0]);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  return { create };
};
