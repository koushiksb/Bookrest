
  /*

  Model to store all the notification details

  */


  const mongoose = require('mongoose');

  const NotifySchema = new mongoose.Schema({
    User:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    Type:{
      type:String
    },
    Message:{
      type:String
    },
    Time:{
      type:Date,
      default:Date.now``
    },
    Status:{
      type:Boolean,
      default:false
    }
  })
  const Notify = mongoose.model('Notify',NotifySchema);

  module.exports=Notify;
