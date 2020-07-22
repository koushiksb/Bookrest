  /*

  books avalilable in each users shelf
  is stored in this model.

  */



  const mongoose = require('mongoose');
  const Book = require('./Book')
  const User = require('./User')
  const ShelfSchema = new mongoose.Schema({
    book : {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Book'
    },
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    softcopy:{
      type:String
    },
    hasHardCopy:{
      type:Boolean,
      default:false
    },
    owner:{
      type:String
    },
    period:{
      type:Date
    },
    paid:{
      type:Number   // 0 not paid, 1 paid
    },
    readRequestAmount:{
      type:Number,
      default:5
    }
    // ra:{
    //   type: mongoose.Schema.Types.mixed
    // }

  })

  const Shelf = mongoose.model('Shelf',ShelfSchema);

  module.exports=Shelf;
