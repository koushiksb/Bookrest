const express=require('express');
const router = express.Router();
const Profile = require('../models/Profile')
const Openbid = require('../models/Openbid')
const Bidding = require('../models/Bidding')
var dateFormat = require('dateformat');
var mongoose = require('mongoose')
const isLoggedIn = require('./utils/isLoggedIn')
router.get('/bidding/:book/:owner/:bidid',isLoggedIn.isLoggedIn,(req,res)=>{
console.log(req.params);
var k =req.user.email.toString()
Profile.findOne({_id:req.user.profile})
.then(async (x)=>{
  var bidfor = req.params.book + '/'+req.params.owner +'/'+ req.params.bidid
  var baseamount = 0
  var details = ' '
  var user = ''
  var id=' '
  var m = 0;
  var lastbidtime=false;
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
      lastbidtime = y[y.length -1].time

    }
  }

    // console.log(y);
    // for (var i = 0; i < y.length; i++) {
    //   y[i] = y[i].toJSON()
    // }
    // console.log(y);
    var info = {username  : x.fname + ' ' + x.lname,userid:req.user.id,room:bidfor,bidid:req.params.bidid,prevbids:y,baseamount:baseamount,details:details,user:user,lastbidtime:lastbidtime,layout:"navbar2.ejs" }
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

router.post('/openbid',isLoggedIn.isLoggedIn,async (req,res)=>{
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

router.get('/mystuff',isLoggedIn.isLoggedIn,(req,res)=>{
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
router.post('/delete',isLoggedIn.isLoggedIn,(req,res)=>{
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
router.post('/updatebid',isLoggedIn.isLoggedIn,(req,res)=>{
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
router.get('/booksSold',isLoggedIn.isLoggedIn,(req,res)=>{
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

router.get('/booksBrought',isLoggedIn.isLoggedIn,(req,res)=>{
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

router.post('/allAuctionFilteredData',(req,res)=>{
  // console.log(req.user.id);
  // var canEdit = true;
  // Openbid.find({ userid: { $not: { $eq: req.user.id } },status:1 }).populate('bookid').sort({date:1}).lean()
  // .then(async x=>{
  //   console.log(x);
  //   await x.forEach((item, i) => {
  //     if(new Date() >=item.date  ){
  //       item['canEdit'] = false;
  //     }
  //     item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
  //     item['actualdate'] = item.date;
  //     item.date = item.date.toISOString().slice(0,16)
  //   });
  //   console.log(x)
  //   return res.json({bids:x})
  //
  // })
  // .catch(err=>{
  //   console.log(err);
  // })
  //
  console.log(req.body)
  console.log('api')
  var genreFilters=[];
  if(req.body.genre.all!=='true'){
  Object.entries(req.body.genre).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  genreFilters.push(item[0])
}
  });
}else{
var genreFilters =[];
genreFilters.push('Fantasy'.toString());
genreFilters.push('Fiction'.toString());
genreFilters.push('Fairytale'.toString());
genreFilters.push('History'.toString());
genreFilters.push('Mystery'.toString());
genreFilters.push('Novel'.toString());
genreFilters.push('Poetry'.toString());
genreFilters.push('Romance'.toString());
genreFilters.push('Thriller'.toString());

console.log('here')
console.log(genreFilters)
}
var priceFilters = 0;
var isPriceFilter = false;
var isAbove = false;
var datefilter = req.body.date;
if(req.body.price.all!=='true'){
  isPriceFilter = true;
  Object.entries(req.body.price).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  if(item[0]==='one'){
    priceFilters=100;
  }
  else if(item[0]==='two'){
    priceFilters=500;
  }
  else if(item[0]==='three'){
    priceFilters=1000;
  }
  else if(item[0]==='four'){
    priceFilters=2500;
  }
  else if(item[0]==='five'){
    priceFilters=5000;
  }
  else{
    priceFilters=5000;
    isAbove = true;
  }

}
  });
}else{
  isPriceFilter=false;

}
console.log(genreFilters)

  Openbid.aggregate([
    {
      $match:{
        userid: { $not: { $eq: new mongoose.Types.ObjectId(req.user.id.toString()) } },
        status:1
    }
  },
  {
    $lookup:{
      from:'books',
      let :{bookid:'$bookid'},
      pipeline:[
        {
          $match: {
    $expr: { $eq: ['$_id', '$$bookid'] }
}

},
        {
        $project:{
          _id:1,
          userid:1,
          username:1,
          ImageURLL:1,
          Title:1,
          Author:1,
          Genre:1,
          Rating:1
        },
      }
    ],
      as:'bookid'
    }
  },
{
    $unwind:{path:'$bookid'}
  },
  {
    $match:{
      "bookid.Genre":{$in:genreFilters}
    }
  }
]).exec(function (err,bids){
  console.log('aggregate');
  if(bids){
    var finaldata=[];
  if(isPriceFilter){
    bids.forEach((item, i) => {
      if(isAbove){
        if(item.baseamount>=priceFilters){
          finaldata.push(item)
        }

      }else{
      if(item.baseamount<=priceFilters){
        finaldata.push(item)
      }
      }
    });
    finaldata.sort((a,b)=>(a.baseamount>b.baseamount)?1:-1);

bids = finaldata;
  }

  bids.forEach((item, i) => {
        if(new Date() >=item.date  ){
          item['canEdit'] = false;
        }
        item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, h:MM TT");
        item['actualdate'] = item.date;
        item.date = item.date.toISOString().slice(0,16)

  });
  if(datefilter!==false && datefilter!==''){
    var datedata = [];
    console.log('datefiletr active')
    var tomorrow = new Date(datefilter);
    tomorrow.setDate(new Date(datefilter).getDate()+1);
    bids.forEach((item, i) => {
      console.log(new Date(item.actualdate))
      console.log(new Date(datefilter))
      console.log(tomorrow)
      if(new Date(item.actualdate)>=new Date(datefilter) && new Date(item.actualdate)<tomorrow){
        datedata.push(item);
      }
    });
    bids=datedata ;
  }


  res.json({bids:bids})

  }
  console.log('asdfgh')
  console.log(datefilter);
  console.log(bids)

})
})

router.post('/myAuctionFilteredData',(req,res)=>{
  console.log(req.body.genre)
  var genreFilters=[];
  if(req.body.genre.all!=='true'){
  Object.entries(req.body.genre).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  genreFilters.push(item[0])
}
  });
}else{
    genreFilters = ['Fantasy','Fiction','Fairytale','History','Mystery','Novel','Poetry','Romance','Thriller'];
}
var priceFilters = 0;
var isPriceFilter = false;
var isAbove = false;
var datefilter = req.body.date;
if(req.body.price.all!='true'){
  console.log('shit');
  isPriceFilter = true;
  Object.entries(req.body.price).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  if(item[0]==='one'){
    priceFilters=100;
  }
  else if(item[0]==='two'){
    priceFilters=500;
  }
  else if(item[0]==='three'){
    priceFilters=1000;
  }
  else if(item[0]==='four'){
    priceFilters=2500;
  }
  else if(item[0]==='five'){
    priceFilters=5000;
  }
  else{
    priceFilters=5000;
    isAbove = true;
  }

}
  });
}else{
  isPriceFilter=false;

}
  Openbid.find({userid:req.user.id,status:1}).populate('bookid').sort({date:1}).lean()
  .then(async x=>{
              await x.forEach((item, i) => {
                item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, hh:MM TT",true);
                item['actualdate'] = item.date;
                item.date = item.date.toISOString().slice(0,16);


              });
      console.log(x)
      var finaldata = [];
      x.forEach((item, i) => {
        if(genreFilters.includes(item.bookid.Genre)){
          finaldata.push(item)
        }
      });
      console.log('lkjhg')
      console.log(finaldata)
      var prefinaldata=[];
    if(isPriceFilter){
      finaldata.forEach((item, i) => {
        if(isAbove){
          if(item.baseamount>=priceFilters){
            prefinaldata.push(item)
          }

        }else{
        if(item.baseamount<=priceFilters){
          prefinaldata.push(item)
        }
        }
      });
      console.log('came')
  finaldata = prefinaldata;
  finaldata.sort((a,b)=>(a.baseamount>b.baseamount)?1:-1);

    }
    console.log('prefilandata');
    console.log(finaldata);
  var bids=finaldata;
    console.log('final')
    console.log(finaldata)
    if(datefilter!==false && datefilter!==''){
      var datedata = [];
      console.log('datefiletr active')
      var tomorrow = new Date(datefilter);
      tomorrow.setDate(new Date(datefilter).getDate()+1);
      bids.forEach((item, i) => {
        console.log(new Date(item.actualdate))
        console.log(new Date(datefilter))
        console.log(tomorrow)
        if(new Date(item.actualdate)>=new Date(datefilter) && new Date(item.actualdate)<tomorrow){
          datedata.push(item);
        }
      });
      bids=datedata ;
    }
    finaldata = bids;
    return res.send({mybids:finaldata,today:new Date().toISOString().slice(0,16)})
  })
  .catch(err=>{
    console.log(err);
  })

})
router.post('/booksSoldAuctionFilteredData',(req,res)=>{
  var genreFilters=[];
  if(req.body.genre.all!=='true'){
  Object.entries(req.body.genre).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  genreFilters.push(item[0])
}
  });
}else{
  genreFilters = ['Fantasy','Fiction','Fairytale','History','Mystery','Novel','Poetry','Romance','Thriller'];
}
var priceFilters = 0;
var isPriceFilter = false;
var isAbove = false;
var datefilter = req.body.date;
if(req.body.price.all!='true'){
  console.log('shit');
  isPriceFilter = true;
  Object.entries(req.body.price).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  if(item[0]==='one'){
    priceFilters=100;
  }
  else if(item[0]==='two'){
    priceFilters=500;
  }
  else if(item[0]==='three'){
    priceFilters=1000;
  }
  else if(item[0]==='four'){
    priceFilters=2500;
  }
  else if(item[0]==='five'){
    priceFilters=5000;
  }
  else{
    priceFilters=5000;
    isAbove = true;
  }

}
  });
}else{
  isPriceFilter=false;

}
  Openbid.find({userid:req.user.id,status:0}).populate({path:'soldto',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookid').lean().then(x=>{
    if(x){
    for (var i = 0; i < x.length; i++) {
      if(x[i].soldto){
      x[i]['username'] = x[i].soldto.profile.fname + ' ' + x[i].soldto.profile.lname;
      }
    }
    }
    console.log(x);
    var finaldata = [];
    x.forEach((item, i) => {
      if(genreFilters.includes(item.bookid.Genre)){
        finaldata.push(item)
      }
    });
    var prefinaldata=[];
  if(isPriceFilter){
    finaldata.forEach((item, i) => {
      if(isAbove){
        if(item.baseamount>=priceFilters){
          prefinaldata.push(item)
        }

      }else{
      if(item.baseamount<=priceFilters){
        prefinaldata.push(item)
      }
      }
    });
    console.log('came')
finaldata = prefinaldata;
finaldata.sort((a,b)=>(a.baseamount>b.baseamount)?1:-1);

  }
  var bids = finaldata;
  if(datefilter!==false && datefilter!==''){
    var datedata = [];
    console.log('datefiletr active')
    var tomorrow = new Date(datefilter);
    tomorrow.setDate(new Date(datefilter).getDate()+1);
    bids.forEach((item, i) => {
      console.log(new Date(item.date))
      console.log(new Date(datefilter))
      console.log(tomorrow)
      if(new Date(item.date)>=new Date(datefilter) && new Date(item.date)<tomorrow){
        datedata.push(item);
      }
    });
    bids=datedata ;
  }
finaldata = bids;
    // res.sendStatus(200)
    res.send({bids:finaldata});
  })

});

router.post('/booksBroughtAuctionFilteredData',(req,res)=>{
  var genreFilters=[];
  if(req.body.genre.all!=='true'){
  Object.entries(req.body.genre).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  genreFilters.push(item[0])
}
  });
}else{
  genreFilters = ['Fantasy','Fiction','Fairytale','History','Mystery','Novel','Poetry','Romance','Thriller'];
}
var priceFilters = 0;
var isPriceFilter = false;
var isAbove = false;
var datefilter = req.body.date;
if(req.body.price.all!='true'){
  console.log('shit');
  isPriceFilter = true;
  Object.entries(req.body.price).forEach((item, i) => {
console.log(item)
if(item[1]==='true' && item[0]!=='all' ){
  if(item[0]==='one'){
    priceFilters=100;
  }
  else if(item[0]==='two'){
    priceFilters=500;
  }
  else if(item[0]==='three'){
    priceFilters=1000;
  }
  else if(item[0]==='four'){
    priceFilters=2500;
  }
  else if(item[0]==='five'){
    priceFilters=5000;
  }
  else{
    priceFilters=5000;
    isAbove = true;
  }

}
  });
}else{
  isPriceFilter=false;

}
  Openbid.find({soldto:req.user.id,status:0}).populate({path:'userid',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookid').lean().then(x=>{
    if(x){
    for (var i = 0; i < x.length; i++) {
      if(x[i].userid){
      x[i]['username'] = x[i].userid.profile.fname + ' ' + x[i].userid.profile.lname;
      }
    }
    }
    console.log(x);
    var finaldata = [];
    x.forEach((item, i) => {
      if(genreFilters.includes(item.bookid.Genre)){
        finaldata.push(item)
      }
    });
    var prefinaldata=[];
  if(isPriceFilter){
    finaldata.forEach((item, i) => {
      if(isAbove){
        if(item.baseamount>=priceFilters){
          prefinaldata.push(item)
        }

      }else{
      if(item.baseamount<=priceFilters){
        prefinaldata.push(item)
      }
      }
    });
    console.log('came')
    finaldata.sort((a,b)=>(a.baseamount>b.baseamount)?1:-1);

finaldata = prefinaldata;
  }
var bids = finaldata;
  if(datefilter!==false && datefilter!==''){
    var datedata = [];
    console.log('datefiletr active')
    var tomorrow = new Date(datefilter);
    tomorrow.setDate(new Date(datefilter).getDate()+1);
    bids.forEach((item, i) => {
      console.log(new Date(item.date))
      console.log(new Date(datefilter))
      console.log(tomorrow)
      if(new Date(item.date)>=new Date(datefilter) && new Date(item.date)<tomorrow){
        datedata.push(item);
      }
    });
    bids=datedata ;
  }
finaldata = bids
    // res.sendStatus(200)
    res.send({bids:finaldata});
  })

});
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
