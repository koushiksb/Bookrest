const mongoose=require('mongoose')
const User = require('./User.js')
const Requestrareschema = new mongoose.Schema({

  owner = {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
            },
  period = {
    type:Date,
  },
  requester={
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'

  },
  status = {
    type:Number,  // 0 means pending,1 means accepted,-1 means declined
  }

})
