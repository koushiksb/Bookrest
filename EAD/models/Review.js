  /*

  Reviews and ratings of every book given by all users
  are stored in this model

  */



  const mongoose = require('mongoose');
  const Book = require('./Book')
  const User = require('./User')
  const ReviewSchema = new mongoose.Schema({
    book : {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Book'
    },
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    rating:{
      type:String
    },
    review:{
      type:String
    }

  })

  const Review = mongoose.model('Review',ReviewSchema);

  module.exports=Review;
