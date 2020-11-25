const User = require("../models/User");
const Admin = require("../models/User");

const getValidUserOrNull = async (id) => {
  let user;
  try {
    user = await User.findById(id).select("-password");
    return user;
  } catch (err) {
    return null;
  }
};

const getValidAdminOrNull = async (id) => {
  let admin;
  try {
    admin = await Admin.findById(id).select("-password");
    return admin;
  } catch (err) {
    return null;
  }
};
module.exports = {
  getValidUserOrNull,
  getValidAdminOrNull,
};
