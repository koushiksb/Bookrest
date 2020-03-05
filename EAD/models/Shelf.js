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
    type:[{type:String}]
  },
  owner:{
    type:String
  },
  period:{
    type:Date
  },
  // ra:{
  //   type: mongoose.Schema.Types.mixed
  // }

})

const Shelf = mongoose.model('Shelf',ShelfSchema);

module.exports=Shelf;
