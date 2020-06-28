const express=require('express');
const router = express.Router();
const Profile = require('../models/Profile')
const Openbid = require('../models/Openbid')
const Bidding = require('../models/Bidding')
var dateFormat = require('dateformat');

router.get('/bidding/:book/:owner/:bidid',(req,res)=>{
console.log(req.params);
var k =req.user.email.toString()
Profile.findOne({_id:req.user.profile})
.then(async (x)=>{
  var bidfor = req.params.book + '/'+req.params.owner +'/'+ req.params.bidid
  var baseamount = 0
  var details = ' '
  var user = ''
  var id=' '
  var m = 0
  await Openbid.findOne({_id:req.params.bidid}).populate('bookid')
  .then(z=>{
    if(z.status==1){

    console.log('this is z');
      console.log(z);
      baseamount = z.baseamount
      details = z
      id = z._id
      if(req.user.id == z.userid){
        m=1
      }


    }else{
      return res.redirect('/book/allbidding')
    }
  })
  .catch(err=>{
    console.log(err);
    return res.sendStatus(500)
  })
  Bidding.find({bidid:id})
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
    var info = {username  : x.fname + ' ' + x.lname,userid:req.user.id,room:bidfor,bidid:req.params.bidid,prevbids:y,baseamount:baseamount,details:details,user:user,layout:"navbar2.ejs" }
    if(m==1){
      return res.render('viewbidding.ejs',info)

    }else{
    return res.render('bidding.ejs',info)
}
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
  var canEdit = true;
  Openbid.find({ userid: { $not: { $eq: req.user.id } },status:1 }).populate('bookid').sort({date:1}).lean()
  .then(async x=>{
    console.log(x);
    await x.forEach((item, i) => {
      if(new Date() >=item.date  ){
        item['canEdit'] = false;
      }
      item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
      item['actualdate'] = item.date;
      item.date = item.date.toISOString().slice(0,16)
    });

    res.render('allbiddings',{bids:x,layout:"navbar2.ejs"})

  })
  .catch(err=>{
    console.log(err);
  })
})

router.post('/openbid',async (req,res)=>{
  var username='Anonymous'

  await Profile.findOne({_id:req.user.profile})
  .then(x=>{
    console.log('here');
    console.log(x);
    username = x.fname +' ' +x.lname
    console.log(username);
  })
  .catch(err=>{
    console.log(err);
  })
  console.log('ssd');
  console.log(username);
  var bid = new Openbid({
    userid:req.user.id,
    username:username,
   bookid:req.body.bookid ,
   baseamount:req.body.baseamount ,
   date:req.body.biddingtime,
   duration:120 ,
   status:1 ,
 });
  bid.save()
  .then(x=>{
    return res.redirect('/book/mystuff')
  })
  .catch(err=>{
    console.log(err);
  })

})

router.get('/mystuff',(req,res)=>{
  Openbid.find({userid:req.user.id,status:1}).populate('bookid').sort({date:1}).lean()
  .then(async x=>{
              await x.forEach((item, i) => {
                item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, hh:MM TT",true);
                item['actualdate'] = item.date;
                item.date = item.date.toISOString().slice(0,16);

              });
      console.log(x)
    return res.render('mystuff',{mybids:x,layout:'navbar2',today:new Date().toISOString().slice(0,16)})
  })
  .catch(err=>{
    console.log(err);
  })
})
router.post('/delete',(req,res)=>{
  console.log('egr');
  console.log(req.body.bidid);
  Openbid.findOneAndDelete({_id:req.body.bidid})
  .then(x=>{
    console.log("done");
    res.sendStatus(200)
  })
  .catch(err=>{
    console.log(err);
  })

})
router.post('/updatebid',(req,res)=>{
  Openbid.findOne({_id:req.body.bidid})
  .then(x=>{
    x.date=req.body.date;
    x.baseamount = req.body.baseamount;
    x.save().then(y=>{
      console.log("done");
      res.sendStatus(200);

    })
  })
  .catch(err=>{
    console.log(err);
    res.sendStatus(500)
  })
res.sendStatus(200)
})
router.get('/booksSold',(req,res)=>{
  Openbid.find({userid:req.user.id,status:0}).populate({path:'soldto',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookid').lean().then(x=>{
    if(x){
    for (var i = 0; i < x.length; i++) {
      if(x[i].soldto){
      x[i]['username'] = x[i].soldto.profile.fname + ' ' + x[i].soldto.profile.lname;
      }
    }
    }
    console.log(x);
    // res.sendStatus(200)
    res.render('booksSold',{bids:x,layout:'navbar2'});
  })
})

router.get('/booksBrought',(req,res)=>{
  Openbid.find({soldto:req.user.id,status:0}).populate({path:'userid',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookid').lean().then(x=>{
    if(x){
    for (var i = 0; i < x.length; i++) {
      if(x[i].userid){
      x[i]['username'] = x[i].userid.profile.fname + ' ' + x[i].userid.profile.lname;
      }
    }
    }
    console.log(x);
    // res.sendStatus(200)
    res.render('booksBrought',{bids:x,layout:'navbar2'});
  })
})
// router.get('/viewbidding',(req,res)=>{
//   Openbid.find({userid:req.user.id}).populate('bookid')
//   .then(x=>{
//     return res.render('viewbidding',{mybids:x})
//   })
//   .catch(err=>{
//     console.log(err);
//   })
// })

module.exports = router;
