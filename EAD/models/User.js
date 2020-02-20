const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email : {
    type:String,
    required:[true,'Valid Email Id Required'],
    unique: true,
  },
  password : {
    type:String,
    required:[true,'Valid Email Id Required'],


  },
  resetPasswordToken: {type:String},
  resetPasswordExpires: {type:Date},
  profile:{type:mongoose.Types.ObjectId}

})

const User = mongoose.model('User',UserSchema);

module.exports=User;
