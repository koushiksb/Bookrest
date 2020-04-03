const express=require('express');
const router = express.Router();
const Profile = require('../models/Profile')
const Openbid = require('../models/Openbid')
const Bidding = require('../models/Bidding')

router.get('/bidding/:book/:owner/:bidid',(req,res)=>{
console.log(req.params);
var k =req.user.email.toString()
Profile.findOne({_id:req.user.profile})
.then(async (x)=>{
  var bidfor = req.params.book + '/'+req.params.owner +'/'+ req.params.bidid
  var baseamount = 0
  var details = ' '
  var user = ''
  await Openbid.findOne({_id:req.params.bidid}).populate('bookid')
  .then(z=>{
    console.log('this is z');
      console.log(z);
      baseamount = z.baseamount
      details = z
  })
  .catch(err=>{
    console.log(err);
    return res.sendStatus(500)
  })
  Bidding.find({})
  .then(y=>{
    console.log(y);
    if (y.length >0){
    if(y[y.length -1].amount>baseamount){
      baseamount = y[y.length -1].amount
      user = y[y.length -1].username
    }
  }

    // console.log(y);
    // for (var i = 0; i < y.length; i++) {
    //   y[i] = y[i].toJSON()
    // }
    // console.log(y);
    var info = {username  : x.fname + ' ' + x.lname,userid:req.user.id,room:bidfor,bidid:req.params.bidid,prevbids:y,baseamount:baseamount,details:details,user:user }
    return res.render('bidding.ejs',info)

  })
  .catch(err=>{
    console.log(err);
    return res.sendStatus(500)
  })

})
.catch(err=>{
  console.log(err);
})

})

router.post('/bidding',(req,res)=>{

  return res.sendStatus(200)
})

router.get('/allbidding',(req,res)=>{
  console.log(req.user.id);
  Openbid.find({ userid: { $not: { $eq: req.user.id } } }).populate('bookid')
  .then(x=>{
    console.log(x);

    res.render('allbiddings',{bids:x})

  })
  .catch(err=>{
    console.log(err);
  })
})

router.post('/openbid',(req,res)=>{
  var username='Anonymous'

  // Profile.findOne({_id:req.user.profile})
  // .then(x=>{
  //   console.log('here');
  //   console.log(x);
  //   var username = x.fname +' ' +x.lname
  //   console.log(username);
  // })
  // .catch(err=>{
  //   console.log(err);
  // })
  // console.log('ssd');
  // console.log(username);
  var bid = new Openbid({
    userid:req.user.id,
    username:req.session.username,
   bookid:req.body.bookid ,
   baseamount:req.body.baseamount ,
   date:Date.now() ,
   duration:120 ,
   status:1 ,
 });
  bid.save()
  .then(x=>{
    return res.redirect('/book/allbidding')
  })
  .catch(err=>{
    console.log(err);
  })

})
module.exports = router;
