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
  is_email_confirmed: {
    type: Boolean,
    default: false,
  },
  is_banned: {
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
});

module.exports = User = mongoose.model(User, UserSchema);
