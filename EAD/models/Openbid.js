const mongoose = require('mongoose')

OpenbidSchema = new mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  username:{
    type:String,

  },
  bookid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Book"
  },
  baseamount:{
    type:Number,
  },
  date:{
    type:Date
  },
  duration:{
    type:Number //probably in mins
  },
  status:{
    type:Number,
    default:1
  },
  typeofcopy:{
    type:String
  },
  soldto:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  soldfor:{
    type:Number
  }       // 0 means over 1 means active
})

const Openbid = mongoose.model('Allbids',OpenbidSchema);

module.exports=Openbid;
