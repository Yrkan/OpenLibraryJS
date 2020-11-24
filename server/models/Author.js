const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  birthYear: {
    type: String,
  },
  deathYear: {
    type: String,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "book",
    },
  ],
  addDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Author = mongoose.model("author", authorSchema);
