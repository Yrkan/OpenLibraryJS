const jwt = require("jsonwebtoken");
const config = require("config");
const { INVALID_TOKEN, UNAUTHORIZED_ACCESS } = require("../const/errors");

const authAdmin = (req, res, next) => {
  const token = req.header("x-auth-token");

  // No token (Unauthorized access)
  if (!token) {
    return res.status(401).json(UNAUTHORIZED_ACCESS);
  }
  try {
    // Decode the JWT
    const decoded = jwt.decode(token, config.get("jwtKey"));
    // Set a request parameter containing user informations
    if (decoded.admin) {
      req.admin = decoded.admin;
      next();
    } else {
      return res.status(401).json(UNAUTHORIZED_ACCESS);
    }
  } catch (err) {
    // In case the token is invalid
    console.log(err);
    return res.status(401).json(INVALID_TOKEN);
  }
};

const authUser = (req, res, next) => {
  const token = req.header("x-auth-token");

  // No token (Unauthorized access)
  if (!token) {
    return res.status(401).json(UNAUTHORIZED_ACCESS);
  }
  try {
    // Decode the JWT
    const decoded = jwt.decode(token, config.get("jwtKey"));
    // Set a request parameter containing user informations
    if (decoded.user) {
      req.user = decoded.user;
    } else {
      return res.status(401).json(UNAUTHORIZED_ACCESS);
    }
    next();
  } catch (err) {
    // In case the token is invalid
    console.log(err);
    return res.status(401).json(INVALID_TOKEN);
  }
};
module.exports = {
  authAdmin,
  authUser,
};
