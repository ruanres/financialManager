const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

module.exports = {
  hashPassword,
};
