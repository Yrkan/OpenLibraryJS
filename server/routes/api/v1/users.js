const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");

const { genConfirmToken } = require("../../../utils/tokens");
const { hashPassword } = require("../../../utils/crypto");
const User = require("../../../models/User");
const Admin = require("../../../models/Admin");
const { getValidUserOrNull } = require("../../../utils/db");
const {
  authAdmin,
  authUser,
  authUserOrAdmin,
} = require("../../../middlewears/auth");
const {
  USERNAME_ALREADY_IN_USE,
  EMAIL_ALREADY_IN_USE,
  EMAIL_ALREADY_VALIDATED,
  INTERNAL_SERVER_ERROR,
  INVALID_ID,
  INVALID_TOKEN,
  INVALID_CREDENTIALS,
  UNAUTHORIZED_ACTION,
} = require("../../../const/errors");
const router = Router();

// @Endpoint:       Get /api/v1/users
// @Description:    Get a list of all users
// @Access:         Private
router.get("/", authAdmin, async (req, res) => {
  try {
    const loggedAdmin = await Admin.findById(req.admin.id);
    if (!loggedAdmin) return res.status(401).json(INVALID_CREDENTIALS);

    // Only superadmins or admins with manageUsers get a list of all users
    if (
      loggedAdmin.permissions.superAdmin ||
      loggedAdmin.permissions.manageUsers
    ) {
      const usersList = await User.find().select("-password");
      return res.send(usersList);
    }
    return res.status(401).json(UNAUTHORIZED_ACTION);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

// @Endpoint:       Get /api/v1/users/:id
// @Description:    Get a single user
// @Access:         Private
router.get("/:id", authUserOrAdmin, async (req, res) => {
  try {
    // Only superadmins or the admin with manage users, or the users themselves can get the infos
    let allowed = false;
    if (req.user) {
      if (req.user.id === req.params.id) {
        allowed = true;
      }
    } else if (req.admin) {
      const loggedAdmin = await Admin.findById(req.admin.id);
      if (
        loggedAdmin.permissions.superAdmin ||
        loggedAdmin.permissions.manageUsers
      ) {
        allowed = true;
      }
    }

    if (allowed) {
      const userInfo = await User.findById(req.params.id).select("-password");
      if (!userInfo) {
        return res.status(400).json(INVALID_ID);
      }
      return res.json(userInfo);
    }
    return res.status(401).json(UNAUTHORIZED_ACTION);
  } catch (err) {
    console.log(err);
    //return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

// @Endpoint:       POST /api/v1/user/register/
// @Description:    Register a new user
// @Access:         Public
router.post(
  "/register",
  [
    //TODO : Better validation
    check("username", "username is required").notEmpty(),
    check("password", "password must be 8 characters or more").isLength({
      min: 8,
    }),
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
        return res.status(400).json(USERNAME_ALREADY_IN_USE);
      } else if (await User.findOne({ email })) {
        return res.status(400).json(EMAIL_ALREADY_IN_USE);
      }

      const hashed = await hashPassword(password);
      const confirmationToken = await genConfirmToken(username, email);
      const newUser = new User({
        username,
        email,
        password: hashed,
        gravatar: gravatar.url(email),
        confirmationToken,
      });

      await newUser.save();
      // TODO : returning the password is risky return token instead
      return res.json(newUser);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       POST /api/v1/user/confirm/:id
// @Description:    Confirm a user email
// @Access:         Public
router.post(
  "/confirm/:id",
  [check("token", "confirm token is required").notEmpty()],
  async (req, res) => {
    try {
      // Bad Request handeling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;
      const user = await getValidUserOrNull(req.params.id);
      if (!user) {
        // TODO : replace Invalid username / Invalid token with the same message
        //        to avoid guessing usernames.
        return res.status(400).json(INVALID_ID);
      }

      // Check if user email is already confirmed
      if (user.isEmailConfirmed) {
        return res.status(400).json(EMAIL_ALREADY_VALIDATED);
      }

      // Check if the token is valid
      if (user.confirmationToken && user.confirmationToken !== token) {
        return res.status(400).json(INVALID_TOKEN);
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
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       PUT /api/v1/user/:id
// @Description:    Update a user
// @Access:         Private
router.put(
  "/:id",
  [
    authAdmin,
    authUser,
    [
      // TODO : proper validation
      check("username", "invalid username").notEmpty().optional(),
      check("password", "password must be 8 characters or more")
        .notEmpty()
        .optional(),
      check("email", "invalid email").isEmail().optional(),
      check("isEmailConfirmed", "invalid email confirmation value")
        .isBoolean()
        .optional(),
      check("isBanned", "invalid ban value").isBoolean().optional(),
    ],
  ],
  async (req, res) => {
    try {
      // Bad Request handeling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // make sure the user id is actually valid
      const user = await getValidUserOrNull(req.params.id);
      if (!user) {
        return res.status(400).json(INVALID_ID);
      }

      //only the user himself or an admin with permission can update
      if (req.admin) {
        const loggedAdmin = await Admin.findById(req.admin.id);
        if (!loggedAdmin) {
          return res.status(401).json(INVALID_CREDENTIALS);
        } else if (
          !(
            loggedAdmin.permissions.superAdmin ||
            loggedAdmin.permissions.manageUsers
          )
        ) {
          return res.status(401).json(UNAUTHORIZED_ACTION);
        }
      } else if (req.user) {
        if (req.user.id !== req.params.id) {
          return res.status(401).json(UNAUTHORIZED_ACTION);
        }
      }

      // Authorized, now update
      const {
        username,
        password,
        email,
        isEmailConfirmed,
        isBanned,
      } = req.body;
      const updates = {};

      if (username) {
        // Make sure username isn't already in user
        if (await User.findOne({ username })) {
          return res.status(400).json(USERNAME_ALREADY_IN_USE);
        }
        updates.username = username;
      }
      if (password) {
        const hashed = await hashPassword(password);
        updates.password = hashed;
      }
      if (email) {
        // Male sure the email isn't in use
        updates.email = email;
        if (await User.findOne({ email })) {
          return res.status(400).json(EMAIL_ALREADY_IN_USE);
        }
        // if the update is made by a user we want to set isEmailConfirmed to false and generate a confirmation token
        // TODO : send an email with validation
        if (req.user) {
          updates.isEmailConfirmed = false;
          updates.confirmationToken = await genConfirmToken(username, email);
        }
      }
      if (isEmailConfirmed) {
        updates.isEmailConfirmed = isEmailConfirmed;
      }
      if (isBanned) {
        updates.isBanned = isBanned;
      }

      const newUserInfo = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });

      return res.json(newUserInfo);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);
module.exports = router;
