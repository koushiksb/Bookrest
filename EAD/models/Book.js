const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  ISBN:{
    type:String
  },
  Title:{
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
  Hardcopy:{
    type:Boolean
  },
  Genre:{
    type:String
  }
})
const Book = mongoose.model('Book',BookSchema);

module.exports=Book;
