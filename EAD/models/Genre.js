const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  Genre:{
    type:String
  }
})
const Genre = mongoose.model('Genre',GenreSchema);

module.exports=Genre;
