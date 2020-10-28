const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const router = Router();
const Admin = require("../../../models/Admin");
const { authAdmin } = require("../../../middlewears/auth");

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
        return res.status(401).json({ error: { msg: "Invalid Credentials" } });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);
      // Invalid Password
      if (!passwordMatch) {
        return res.status(401).json({ error: { msg: "Invalid Credentials" } });
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
      return res.status(500).json({ error: { msg: "Server Error" } });
    }
  }
);

// @Endpoint:       Get /api/v1/auth
// @Description     Get Authentificated admin
// @Access          Private
router.get("/", authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) res.status(401).json({ error: { msg: "Invalid Admin" } });
    return res.json(admin);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: { msg: "Server Error" } });
  }
});
module.exports = router;
