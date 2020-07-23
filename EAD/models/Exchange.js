  /*

  This model is to store data related to all the exchange requests
  raised by the users.

  */


  const mongoose = require('mongoose');
  const Book = require('./Book')
  const User = require('./User')
  const ExchangeSchema = new mongoose.Schema({
    bookReq: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Book'
    },
    bookSen: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Book'
    },
    userReq:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    userAcc:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    status:{
      type:Boolean,
      default:false
    },
    exchangeReq:{
      type:Boolean,
      default:false
    },
    exchangeSen:{
      type:Boolean,
      default:false
    }
  })

  const Exchange = mongoose.model('Exchange',ExchangeSchema);

  module.exports=Exchange;
