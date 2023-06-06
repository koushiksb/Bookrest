/*

  All the lend requests of every user is stored in this model

  */

const mongoose = require("mongoose");
const User = require("./User.js");
const Book = require("./Book.js");

const Requestrareschema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  period: {
    type: Number,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notetoowner: {
    type: String,
  },
  status: {
    type: Number, // 0 means pending,1 means accepted,-1 means declined
  },
});
const RareRequest = mongoose.model("rarerequest", Requestrareschema);
module.exports = RareRequest;
