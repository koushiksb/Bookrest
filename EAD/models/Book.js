const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  ISBN:{
    type:String
  },
  Book-Title:{
    type:String
  },

  Book-Author:{
    type:String
  },
  Year-Of-Publication:{
    type:String
  },
  Publisher:{
    type:String
  },
  Image-URL-S:{
    type:String
  },
  Image-URL-M:{
    type:String
  },
  Image-URL-L:{
    type:String
  }
})
const Book = mongoose.model('Book',BookSchema);

module.exports=Book;
