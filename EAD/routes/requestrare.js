const express=require('express');
const router = express.Router();
const User=require('../models/User')
const Profile=require('../models/Profile')

const Shelf=require('../models/Shelf')
const RareRequest=require('../models/RareRequest')
const async = require('async')

router.get('/shelf',(req,res)=>{
  console.log(req.user.email);
  Shelf.find({user:req.user.id}).select('book -_id').populate('book','Title').then(x=>{
    console.log(x[0]);
    return res.render('dummyshelf',{book:x})
  })


})

router.get('/request',(req,res)=>{
    req.session.name = 'asdfgb'
    Shelf.find({user:req.user.id}).select('book -_id').populate('book','Title').then(x=>{
      console.log(x[0]);
      return res.render('dummyviewshelf',{book:x})
    })


})

router.post('/request',(req,res)=>{

console.log('posted');
console.log(req.body);

RareRequest.findOne({recipient:req.session.otherUserShelfUserId,book:req.body.bookid,requester:req.user.id}).then(a=>{

    // var datee = new Date()
    // datee.setDate(datee.getDate() + req.body.noofdays);
    var k  = new RareRequest({
      recipient:req.session.otherUserShelfUserId,
      book:req.body.bookid,
      period:req.body.noofdays,
      notetoowner:req.body.notetoowner,
    // '5e5a9d624f4f426bfc199fb1'
      requester:req.user.id,
      status:0

    })
    k.save()
    .then(x=>{
      console.log('saved');
      return res.sendStatus(200)
    })
    .catch(err=>{
      console.log(err);
      return res.sendStatus(500)
    })

}

)


})

router.get('/viewrequest',(req,res)=>{

console.log('found');
RareRequest.find({recipient:req.user.id,status:0}).populate({path:'requester',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(x=>{
// RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
console.log(x);
  return res.render('dummyviewrequest',{requests:x,layout:'navbar2'})
})
})
router.get('/viewsentrequest',(req,res)=>{

console.log('found');
RareRequest.find({requester:req.user.id,status:0}).populate({path:'recipient',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(async (x)=>{
// RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
console.log(x);
console.log('exchange............');
for(var i = 0; i <  x.length; i++) {
  var y = x[i].recipient
  x[i].recipient = x[i].requester;
  x[i].requester =y;

}
console.log(x);
  return res.render('sentRequests',{requests:x,layout:'navbar2'})
// return res.sendStatus(200)
})
})
router.get('/oldrequests',(req,res)=>{
  RareRequest.find({requester:req.user.id,status:{$ne:0}}).populate({path:'recipient',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(async (x)=>{
  // RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
  console.log(x);
  console.log('exchange............');
  for(var i = 0; i <  x.length; i++) {
    var y = x[i].recipient
    x[i].recipient = x[i].requester;
    x[i].requester =y;

  }
  console.log(x);
    return res.render('oldrequests',{requests:x,layout:'navbar2'})
  // return res.sendStatus(200)
  })

})

router.post('deleterequest',(req,res)=>{
  RareRequest.findOneAndDelete({_id:req.body._id}).then(x=>{
    res.sendStatus(200);
  })
  .catch(err=>{
    res.sendStatus(500)
  })
})

router.post('/viewrequest',(req,res)=>{
  console.log('posted');

  console.log(req.body);

  RareRequest.find({book:req.body.bookid,recipient:req.user._id}).then(async x=>{
    x = x[x.length-1]
    console.log(x);
    console.log(req.body.status);
    var till_date = new Date();
    till_date.setDate(till_date.getDate() + x.period);
    x.status=Number(req.body.status)
  await  x.save()
    var softcopylink = '';

  await  Shelf.findOne({user:req.user.id,book:req.body.bookid}).then(softCopy=>{
      softcopylink = softCopy.softcopy
    })
    if(req.body.status == 1){
      var add  = new Shelf({
        book:req.body.bookid,
        user:req.body.requester,
        owner:'1',
        paid:0,
        softcopy:softcopylink,
        period:till_date

      });
      add.save().then(a=>{
        return res.sendStatus(200)

      })
    }else{
      console.log('jhgfdsa');
      return res.sendStatus(200)

    }
  })
  .catch(err=>{
    console.log(err);
    return res.sendStatus(500)
  })


})


module.exports  = router
