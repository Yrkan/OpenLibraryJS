const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");

  // No token (Unauthorized access)
  if (!token) {
    return res.status(401).json({ error: { msg: "Unauthorized Acess" } });
  }
  try {
    // Decode the JWT
    const decoded = jwt.decode(token, config.get("JWTKey"));
    // Set a request parameter containing user informations
    req.user = decoded.user;
    next();
  } catch (err) {
    // In case the token is invalid
    return res.status(401).json({ error: { msg: "Invalid Token" } });
  }
};
