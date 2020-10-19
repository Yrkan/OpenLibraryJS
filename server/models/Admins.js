const mongoose = require("mongoose");

const AdminsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    // Highest role can manage other admins (preferably keep only 1 superAdmin)
    superAdmin: {
      type: Boolean,
      default: false,
    },
    manageUsers: {
      type: Boolean,
      default: true,
    },
    manageComments: {
      type: Boolean,
      default: true,
    },
    // Create / Modify / Delete Books or w.e you use this cms for
    create: {
      type: Boolean,
      default: true,
    },
    modify: {
      type: Boolean,
      default: true,
    },
    delete: {
      type: Boolean,
      default: true,
    },
  },
  creationDate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Admins = mongoose.model("admins", AdminsSchema);
