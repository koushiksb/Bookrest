const express=require('express');
const router = express.Router();
const User=require('../models/User')
const Shelf=require('../models/Shelf')
const RareRequest=require('../models/RareRequest')

router.get('/shelf',(req,res)=>{
  console.log(req.user.email);
  Shelf.find({user:req.user.id}).select('book -_id').populate('book','Title').then(x=>{
    console.log(x[0]);
    return res.render('dummyshelf',{book:x})
  })


})

router.get('/request',(req,res)=>{

    Shelf.find({user:'5e5a9d624f4f426bfc199fb0'}).select('book -_id').populate('book','Title').then(x=>{
      console.log(x[0]);
      return res.render('dummyviewshelf',{book:x})
    })


})

router.post('/request',(req,res)=>{

console.log('posted');
console.log(req.body.bookid);
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


})

router.get('/viewrequest',(req,res)=>{

console.log('found');
RareRequest.find({recipient:'5e5a9d624f4f426bfc199fb0',status:0}).populate('book','Title').then(x=>{
  return res.render('dummyviewrequest',{requests:x})
})
})

router.post('/viewrequest',(req,res)=>{
  console.log(req.body);
  RareRequest.findOneAndUpdate({book:req.body.bookid,recipient:'5e5a9d624f4f426bfc199fb0'},{status:req.body.status}).then(x=>{
    return res.sendStatus(200)
  })
  .catch(err=>{
    console.log(err);
    return res.sendStatus(500)
  })


})


module.exports  = router
