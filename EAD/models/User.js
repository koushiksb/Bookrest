const mongoose = require('mongoose');
const Profile = require('./Profile')
const UserSchema = new mongoose.Schema({
  email : {
    type:String,
    required:[true,'Valid Email Id Required'],
    unique: true,
    lowecase:true
  },
  password : {
    type:String,
  },
  googleid:{
    type:String,
  },
  method:{
    type:String
  },
  resetPasswordToken: {type:String},
  resetPasswordExpires: {type:Date},
  profile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Profile'
  },
  isVerified:{
    type:Boolean,
    default:false
  }

})

const User = mongoose.model('User',UserSchema);

module.exports=User;
