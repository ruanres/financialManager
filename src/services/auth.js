const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthorizationError = require('../error/AuthorizationError');
const NotFoundError = require('../error/NotFoundError');

module.exports = (app) => {
  const signin = async (credentials) => {
    const SECRET = 'secret';
    const hourInSec = 3600;
    const dayInHours = 24;
    const expirationTime = hourInSec * dayInHours;
    const user = await app.services.user.findOne({ email: credentials.email });

    if (!user) throw new NotFoundError('User not found');

    const itMatches = await bcrypt.compare(credentials.password, user.password);
    if (itMatches) {
      const { id, name, email } = user;
      const token = jwt.sign({ id, name, email }, SECRET, { expiresIn: expirationTime });
      return { token };
    }
    throw new AuthorizationError('Wrong password');
  };

  return { signin };
};
