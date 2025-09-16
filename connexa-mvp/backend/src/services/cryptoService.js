// Serviço de criptografia usando bcryptjs
const bcrypt = require('bcryptjs');

const saltRounds = 10;

module.exports = {
  async hashData(data) {
    return await bcrypt.hash(data, saltRounds);
  },
  async compareData(data, hash) {
    return await bcrypt.compare(data, hash);
  }
};
