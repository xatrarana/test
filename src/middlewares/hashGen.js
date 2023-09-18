const bcrypt = require("bcrypt");
async function hasGen(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = hasGen;
