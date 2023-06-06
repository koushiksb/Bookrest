/*

  Model to store the users opinion/feedback about the books
  such as whether it is a common book or popular book or rare book
  This data is used to classify book as popular, common or rare
  */

const mongoose = require("mongoose");
const Book = require("./Book");
const User = require("./User");
const ClassifySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  opinion: {
    type: String,
  },
  know: {
    type: Boolean,
  },
});

const Classify = mongoose.model("Classify", ClassifySchema);

module.exports = Classify;
