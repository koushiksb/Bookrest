const mongoose = require('mongoose');


const BiddingSchema = mongoose.Schema({
  room:{
    type:String,

  },
  username:{
    type:String,
  },
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  amount:{
    type:Number,
  },
  time:{
    type:Date,
    default:Date.now
  },
  bidid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Allbids'
  }

})

const Bidding = mongoose.model('Bidding',BiddingSchema);


module.exports = Bidding;
