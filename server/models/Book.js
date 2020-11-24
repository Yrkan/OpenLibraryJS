const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "author",
    required: true,
  },
  writeYear: {
    type: String,
  },
  summary: {
    type: String,
  },
  ISBN: {
    type: String,
  },
  genre: [String],
  addDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Book = mongoose.model("book", bookSchema);
