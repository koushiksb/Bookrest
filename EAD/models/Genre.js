  /*

  This model to store different type of book genres available
  currently in our website/data.

  */


  const mongoose = require('mongoose');

  const GenreSchema = new mongoose.Schema({
    Genre:{
      type:String
    }
  })
  const Genre = mongoose.model('Genre',GenreSchema);

  module.exports=Genre;
