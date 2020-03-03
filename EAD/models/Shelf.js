const mongoose = require('mongoose');

const ShelfSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',

  },
  book:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Book',
  }
})
const Shelf = mongoose.model('Shelf',ShelfSchema);

module.exports=Shelf;
