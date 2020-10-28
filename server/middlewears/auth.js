const jwt = require("jsonwebtoken");
const config = require("config");

const authAdmin = (req, res, next) => {
  const token = req.header("x-auth-token");

  // No token (Unauthorized access)
  if (!token) {
    return res.status(401).json({ error: { msg: "Unauthorized Acess" } });
  }
  try {
    // Decode the JWT
    const decoded = jwt.decode(token, config.get("jwtKey"));
    // Set a request parameter containing user informations
    req.admin = decoded.admin;
    next();
  } catch (err) {
    // In case the token is invalid
    console.log(err);
    return res.status(401).json({ error: { msg: "Invalid Token" } });
  }
};

const authUser = (req, res, next) => {
  const token = req.header("x-auth-token");

  // No token (Unauthorized access)
  if (!token) {
    return res.status(401).json({ error: { msg: "Unauthorized Acess" } });
  }
  try {
    // Decode the JWT
    const decoded = jwt.decode(token, config.get("jwtKey"));
    // Set a request parameter containing user informations
    req.user = decoded.user;
    next();
  } catch (err) {
    // In case the token is invalid
    console.log(err);
    return res.status(401).json({ error: { msg: "Invalid Token" } });
  }
};
module.exports = {
  authAdmin,
  authUser,
};
