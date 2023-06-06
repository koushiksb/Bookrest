/*

  User profile information is stored in this module

  */

const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  fname: {
    type: String,
    lowercase: true,
  },
  lname: {
    type: String,
    lowercase: true,
  },

  location: {
    type: String,
    lowercase: true,
  },
  address: {
    type: String,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  favouriteGenre: [{ type: String }],
  profilepic: { type: String },
});
const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
