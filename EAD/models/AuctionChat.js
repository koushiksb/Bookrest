const mongoose = require('mongoose');


const AuctionChatSchema = mongoose.Schema({
  room:{
    type:String,

  },
  message:{
    type:String,
  },
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  bidid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Allbids'
  }

})

const AuctionChat = mongoose.model('AuctionChat',AuctionChatSchema);


module.exports = AuctionChat;
