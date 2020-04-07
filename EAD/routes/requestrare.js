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
    Shelf.find({user:'5e5a9d624f4f426bfc199fb0'}).select('book -_id').populate('book','Title').then(x=>{
      console.log(x[0]);
      return res.render('dummyviewshelf',{book:x})
    })


})

router.post('/request',(req,res)=>{

console.log('posted');
console.log(req.body.bookid);
RareRequest.findOne({recipient:'5e5a9d624f4f426bfc199fb0',book:req.body.bookid,requester:req.user.id}).then(a=>{
  if(a==null){
    var k  = new RareRequest({
      recipient:'5e5a9d624f4f426bfc199fb0',
      book:req.body.bookid,
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

  }else{
    console.log('alredyrequested');
  }
}

)


})

router.get('/viewrequest',(req,res)=>{

console.log('found');
RareRequest.find({recipient:req.user.id,status:'0'}).populate({path:'requester',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(x=>{
// RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
console.log(x);
  return res.render('dummyviewrequest',{requests:x,layout:'navbar2'})
})
})

router.post('/viewrequest',(req,res)=>{
  console.log('posted');

  console.log(req.body);

  RareRequest.findOne({book:req.body.bookid,recipient:req.user.id}).then(x=>{
    console.log(x);
    console.log(req.body.status);
    x.status=req.body.status
    x.save()
    if(req.body.status == 1){
      var add  = new Shelf({
        book:req.body.bookid,
        user:req.body.requester,
        owner:'1',
        paid:0

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
