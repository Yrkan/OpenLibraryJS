const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const router = Router();
const Admin = require("../../../models/Admin");
const User = require("../../../models/User");
const { authAdmin, authUser } = require("../../../middlewears/auth");
const {
  INTERNAL_SERVER_ERROR,
  INVALID_CREDENTIALS,
} = require("../../../const/errors");

// @Endpoint:       POST /api/v1/auth/login/admins
// @Description:    Login admin
// @Access:         Public
router.post(
  "/login/admins",
  [
    check("username", "username is required").notEmpty(),
    check("password", "password is required").notEmpty(),
  ],
  async (req, res) => {
    // Bad Request Handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Good Request
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });
      // Username not found
      if (!admin) {
        return res.status(401).json(INVALID_CREDENTIALS);
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);
      // Invalid Password
      if (!passwordMatch) {
        return res.status(401).json(INVALID_CREDENTIALS);
      }

      // Return a JWT
      const payload = {
        admin: { id: admin._id },
      };

      jwt.sign(
        payload,
        config.get("jwtKey"),
        { expiresIn: 90000 },
        (err, token) => {
          if (err) throw err;
          return res.json(token);
        }
      );
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       POST /api/v1/auth/login/users
// @Description:    Login users
// @Acess:          Public

router.post(
  "/login/users",
  [
    check("username", "username is required").notEmpty(),
    check("password", "password is required").notEmpty(),
  ],
  async (req, res) => {
    // Bad Request Handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Good Request
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      // Username not found
      if (!user) {
        return res.status(401).json(INVALID_CREDENTIALS);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      // Invalid Password
      if (!passwordMatch) {
        return res.status(401).json(INVALID_CREDENTIALS);
      }

      // Return a JWT
      const payload = {
        user: { id: user._id },
      };

      jwt.sign(
        payload,
        config.get("jwtKey"),
        { expiresIn: 90000 },
        (err, token) => {
          if (err) throw err;
          return res.json(token);
        }
      );
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       Get /api/v1/auth/admin
// @Description     Get Authentificated admin
// @Access          Private
router.get("/admin", authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) res.status(401).json(INVALID_CREDENTIALS);
    return res.json(admin);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

// @Endpoint:       Get /api/v1/auth/user
// @Description     Get Authentificated user
// @Access          Private
router.get("/user", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) res.status(401).json(INVALID_CREDENTIALS);
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
