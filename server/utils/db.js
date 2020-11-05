const User = require("../models/User");

const getValidUserOrNull = async (id) => {
  let user;
  try {
    user = await User.findById(id).select("-password");
    return user;
  } catch (err) {
    return null;
  }
};

module.exports = {
  getValidUserOrNull,
};
