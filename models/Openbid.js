/*

  Model to store all the auction details such as
  who put which book or auction and who bought it for what amount.

  */

const mongoose = require("mongoose");

OpenbidSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  username: {
    type: String,
  },
  bookid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  baseamount: {
    type: Number,
  },
  date: {
    type: Date,
  },
  duration: {
    type: Number, //probably in mins
  },
  status: {
    type: Number,
    default: 1, // 0 means over 1 means active
  },
  typeofcopy: {
    type: String,
  },
  soldto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  soldfor: {
    type: Number,
  },
});

const Openbid = mongoose.model("Allbids", OpenbidSchema);

module.exports = Openbid;
