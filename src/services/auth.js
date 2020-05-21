const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');

module.exports = (app) => {
  const signin = async (credentials) => {
    const SECRET = 'SUPER_SECRET';
    const user = await app.services.user.findOne({ email: credentials.email });
    const itMatches = await bcrypt.compare(credentials.password, user.password);
    if (itMatches) {
      const { id, name, email } = user;
      const token = jwt.encode({ id, name, email }, SECRET);
      return { token };
    }
    throw new Error('Wrong password');
  };

  return { signin };
};
