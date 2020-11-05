// Bad Request
const INVALID_TOKEN = { error: { msg: "Invalid token" } };
const INVALID_ID = { error: { msg: "Invalid ID" } };
const INVALID_CREDENTIALS = { error: { msg: "Invalid Credentials" } };

// Server
const INTERNAL_SERVER_ERROR = { error: { msg: "Internal server Error" } };

// Validation
const USERNAME_ALREADY_IN_USE = { error: { msg: "Username already in use" } };
const EMAIL_ALREADY_IN_USE = { error: { msg: "Email already in use" } };
const EMAIL_ALREADY_VALIDATED = { error: { msg: "Email already confirmed" } };

// Unauthorized
const UNAUTHORIZED_ACTION = { error: { msg: "Unauthorized action" } };
module.exports = {
  USERNAME_ALREADY_IN_USE,
  EMAIL_ALREADY_IN_USE,
  EMAIL_ALREADY_VALIDATED,
  INTERNAL_SERVER_ERROR,
  INVALID_ID,
  INVALID_TOKEN,
  INVALID_CREDENTIALS,
  UNAUTHORIZED_ACTION,
};
