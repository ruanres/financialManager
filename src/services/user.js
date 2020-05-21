const bcrypt = require('bcrypt');
const ValidationError = require('../error/ValidationError');

const saltRounds = 10;

module.exports = (app) => {
  const findOne = (filter = {}) => app.db('users').where(filter).first();

  const findAll = () => app.db('users').select(['name', 'id', 'email']);

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Name must not be null');
    if (!user.email) throw new ValidationError('Email must not be null');
    if (!user.password) throw new ValidationError('Password must not be null');

    const sameEmailUser = await findOne({ email: user.email });
    if (sameEmailUser) throw new ValidationError('Email must be unique');

    const newUser = { ...user };
    newUser.password = await bcrypt.hash(user.password, saltRounds);
    return app.db('users').insert(newUser, ['name', 'id', 'email']);
  };

  return { findAll, save, findOne };
};
