const jwt = require("jsonwebtoken");
const config = require("config");

const genConfirmToken = async (username, email) => {
  const confirmationToken = await jwt.sign(
    { username, email },
    config.get("jwtKey")
  );
  return confirmationToken;
};

module.exports = { genConfirmToken };
