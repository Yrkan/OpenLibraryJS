const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const { authAdmin } = require("../../../middlewears/auth");
const router = Router();
const Admin = require("../../../models/Admin");
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

// @Endpoint:       Get /api/v1/admins
// @Description:    Get a list of all admins
// @Access:         Private
router.get("/", authAdmin, async (req, res) => {
  try {
    const loggedAdmin = await Admin.findById(req.admin.id);
    if (!loggedAdmin) return res.status(401).json(INVALID_CREDENTIALS);

    // Only superadmins can get a list of all admins
    // IMPORTANT!!!! HAVING MULTIPLE SUPER ADMINS CAN CAUSE PROBLEMS !!!!
    if (!loggedAdmin.permissions.superAdmin) {
      return res.status(401).json(UNAUTHORIZED_ACTION);
    }

    const adminsList = await Admin.find();
    return res.send(adminsList);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

// @Endpoint:       Get /api/v1/admins/:id
// @Description:    Get a single admin
// @Access:         Private
router.get("/:id", authAdmin, async (req, res) => {
  try {
    const loggedAdmin = await Admin.findById(req.admin.id);
    if (!loggedAdmin) res.status(401).json(INVALID_CREDENTIALS);

    // Only superadmins or the admin with the request id can get the infos
    // IMPORTANT!!!! HAVING MULTIPLE SUPER ADMINS CAN CAUSE PROBLEMS !!!!
    if (loggedAdmin.permissions.superAdmin || req.admin.id === req.params.id) {
      const adminInfo = await Admin.findById(req.params.id);
      if (!adminInfo) {
        return res.status(400).json(INVALID_ID);
      }

      return res.json(adminInfo);
    }
    return res.status(401).json(UNAUTHORIZED_ACTION);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

// @Endpoint:       POST /api/v1/admins
// @Description:    Create an Admin
// @Access:         Private
router.post(
  "/",
  [
    authAdmin,
    [
      check("username", "username is required").notEmpty(),
      check("password", "password is required").notEmpty(),
      check("email", "Invalid Email").isEmail().optional(),
    ],
  ],
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json(validationErrors.array());
    }

    try {
      const loggedAdmin = await Admin.findById(req.admin.id);
      if (!loggedAdmin) {
        res.status(401).json(INVALID_CREDENTIALS);
      }
      // Only superadmins can create admins
      // IMPORTANT!!!! HAVING MULTIPLE SUPER ADMINS CAN CAUSE PROBLEMS !!!!
      if (!loggedAdmin.permissions.superAdmin) {
        return res.status(401).json(UNAUTHORIZED_ACTION);
      }
      const { username, password, email, permissions } = req.body;

      // Check if username is already in use
      const usernameInUse = await Admin.findOne({ username });
      if (usernameInUse) {
        return res.status(400).json(USERNAME_ALREADY_IN_USE);
      }

      // Check if email is  already in use
      const emailInUse = await Admin.findOne({ email });
      if (emailInUse) {
        return res.status(400).json(EMAIL_ALREADY_IN_USE);
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const newAdmin = new Admin({
        username,
        password: hashed,
      });
      if (email) newAdmin.email = email;
      if (permissions) newAdmin.permissions = permissions;

      await newAdmin.save();
      return res.json(newAdmin);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       POST /api/v1/admins/:id
// @Description:    Update an Admin infos
// @Access:         Private
router.put(
  "/:id",
  [
    authAdmin,
    [
      check("email", "Invalid email address").isEmail().optional(),
      check("username", "Invalid username").notEmpty().optional(),
      check("password", "Invalid username").notEmpty().optional(),
    ],
  ],
  async (req, res) => {
    try {
      // Only superadmins can edit other admins
      // IMPORTANT!!!! HAVING MULTIPLE SUPER ADMINS CAN CAUSE PROBLEMS !!!!
      const loggedAdmin = await Admin.findById(req.admin.id);
      if (!loggedAdmin.permissions.superAdmin) {
        return res.status(401).json(UNAUTHORIZED_ACTION);
      }

      const { username, password, email, permissions } = req.body;

      const updates = {};
      // Adding username to updated
      if (username) {
        // Make sure the updated username isn't used
        if (await Admin.findOne({ username })) {
          return res.status(400).json(USERNAME_ALREADY_IN_USE);
        }
        updates.username = username;
      }

      // Adding Email to updates
      if (email) {
        // Make sure the updated email isn't used
        if (await Admin.findOne({ email })) {
          return res.status(400).json(EMAIL_ALREADY_IN_USE);
        }
        updates.email = email;
      }

      // Adding Password to updates
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        updates.password = hashed;
      }

      // Adding permissions
      if (permissions) {
        const permissionsUpdates = {};
        if (permissions.superAdmin) {
          permissionsUpdates.superAdmin = permissions.superAdmin;
        }
        if (permissions.manageUsers) {
          permissionsUpdates.manageUsers = permissions.manageUsers;
        }
        if (permissions.manageComments) {
          permissionsUpdates.manageComments = permissions.manageComments;
        }
        if (permissions.create) {
          permissionsUpdates.create = permissions.create;
        }
        if (permissions.modify) {
          permissionsUpdates.modify = permissions.modify;
        }
        if (permissions.delete) {
          permissionsUpdates.delete = permissions.delete;
        }
        updates.permissions = permissionsUpdates;
      }
      try {
        const newUserInfo = await Admin.findByIdAndUpdate(
          req.params.id,
          updates,
          {
            new: true,
          }
        );
        if (newUserInfo) {
          return res.json(newUserInfo);
        }
        // no user with that id
        return res.status(400).json(INVALID_ID);
      } catch (err) {
        // TODO : BETTER ERROR HANDLING
        return res.status(400).json(INVALID_ID);
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
);

// @Endpoint:       DELETE /api/v1/admins/:id
// @Description:    Delete an Admin
// @Access:         Private
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    // Only superadmins can edit other admins
    // IMPORTANT!!!! HAVING MULTIPLE SUPER ADMINS CAN CAUSE PROBLEMS !!!!
    const loggedAdmin = await Admin.findById(req.admin.id);
    if (!loggedAdmin) res.status(401).json(INVALID_CREDENTIALS);

    if (!loggedAdmin.permissions.superAdmin) {
      return res.status(401).json(UNAUTHORIZED_ACTION);
    }
    try {
      const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
      if (deletedAdmin) {
        return res.json(deletedAdmin);
      }
      return res.status(400).json(INVALID_ID);
    } catch (err) {
      console.error(err);
      return res.status(400).json(INVALID_ID);
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
