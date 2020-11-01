const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../../../models/User");

const router = Router();

// @Endpoint:       POST /api/v1/user/register/
// @Description:    Register a new user
// @Access:         Public
router.post(
  "/register",
  [
    //TODO : Better validation
    check("username", "username is required").notEmpty(),
    check("password", "password is required").notEmpty(),
    check("email", "email is required").isEmail(),
  ],
  async (req, res) => {
    try {
      // Bad Request handeling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password, email } = req.body;

      // Check if username or email are already in use
      if (await User.findOne({ username })) {
        return res
          .status(400)
          .json({ error: { msg: "Username already in use" } });
      } else if (await User.findOne({ email })) {
        return res.status(400).json({ error: { msg: "Email already in use" } });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const confirmationToken = await jwt.sign(
        { username, email },
        config.get("jwtKey")
      );
      const newUser = new User({
        username,
        email,
        password: hashed,
        gravatar: gravatar.url(email),
        confirmationToken,
      });

      await newUser.save();
      return res.json(newUser);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: { msg: "Server Error" } });
    }
  }
);

// @Endpoint:       POST /api/v1/user/confirm/
// @Description:    Confirm a user email
// @Access:         Public
router.post(
  "/confirm",
  [
    check("username", "username is required").notEmpty(),
    check("token", "confirm token is required"),
  ],
  async (req, res) => {
    try {
      // Bad Request handeling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, token } = req.body;
      // Check if the user exist
      const user = await User.findOne({ username }).select("-password");
      if (!user) {
        // TODO : replace Invalid username / Invalid token with the same message
        //        to avoid guessing usernames.
        return res.status(400).json({ error: { msg: "Invalid username" } });
      }

      // Check if user email is already confirmed
      if (user.isEmailConfirmed) {
        return res
          .status(400)
          .json({ error: { msg: "Email already confirmed" } });
      }

      // Check if the token is valid
      if (user.confirmationToken && user.confirmationToken !== token) {
        return res.status(400).json({ error: { msg: "Invalid token" } });
      }

      // Valid token, confirm the user and remove the token
      user.isEmailConfirmed = true;
      // TODO : Maybe unset the confirmation token ?
      user.confirmationToken = "";

      // Save the document and return the user informations
      await user.save();
      return res.json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: { msg: "Server Error" } });
    }
  }
);
module.exports = router;
