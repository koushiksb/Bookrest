/*

Model to store all the data related to the user to user chat in Ongoing exchanges page.

*/

const mongoose = require("mongoose");

const TradeChatSchema = mongoose.Schema({
  room: {
    type: String,
  },
  message: {
    type: String,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  exchangeid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exchange",
  },
});

const ExchangeChat = mongoose.model("ExchangeChat", TradeChatSchema);

module.exports = ExchangeChat;
