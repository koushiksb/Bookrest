const mongoose = require('mongoose');
const Book = require('./Book')
const User = require('./User')
const ClassifySchema = new mongoose.Schema({
  book : {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Book'
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  opinion:{
  	type:String
  },
  know:{
  	type:Boolean
  }
})

const Classify = mongoose.model('Classify',ClassifySchema);

module.exports=Classify;
