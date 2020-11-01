const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gavatar: {
    type: String,
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  confirmationToken: {
    type: String,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  library: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "book",
      },
      addDate: {
        type: Date,
      },
    },
  ],
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("user", UserSchema);
