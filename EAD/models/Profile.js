const mongoose = require('mongoose');

const ProfileSchema = new mongoose.schema({
  name:{
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
  }
})
