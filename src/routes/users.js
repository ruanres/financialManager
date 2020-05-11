module.exports = (app) => {
  const findAll = async (req, res) => {
    const users = await app.db('users').select();
    res.status(200).json(users);
  };

  const create = async (req, res) => {
    const newUser = await app.db('users').insert(req.body, '*');
    res.status(201).json(newUser);
  };

  return { findAll, create };
};
