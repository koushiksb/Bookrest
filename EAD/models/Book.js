
  /*

  Model to store all the books details

  */


  const mongoose = require('mongoose');

  const BookSchema = new mongoose.Schema({
    ISBN:{
      type:String
    },
    Title:{
      type:String
    },
    Class:{
      type:String
    },
    Author:{
      type:String
    },
    YearOfPublication:{
      type:String
    },
    Publisher:{
      type:String
    },
    ImageURLS:{
      type:String
    },
    ImageURLM:{
      type:String
    },
    ImageURLL:{
      type:String
    },
    Rating:{
      type:Number
    },
    Treviews:{
      type:Number
    },
    Genre:{
      type:String
    },
    Similar:[{type:mongoose.Schema.Types.ObjectId,
      ref:'Book'}]
  })
  const Book = mongoose.model('Book',BookSchema);

  module.exports=Book;
