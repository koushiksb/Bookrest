const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  fname:{
    type:String,
    lowercase:true
  },
  lname:{
    type:String,
    lowercase:true
  },

  location:{
    type:String,
    lowercase:true
  },
  address:{
    type:String,
    lowercase:true
  },
  phone:{
    type:String
  },
  favouriteGenre:[{type:String}],

})
const Profile = mongoose.model('Profile',ProfileSchema);

module.exports=Profile;
