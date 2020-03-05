const express=require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const User = require('../models/User.js');
const Exchange = require('../models/Exchange.js');
const Profile = require('../models/Profile.js');
const Shelf = require('../models/Shelf.js');


router.post('/exchange',(req,res)=>{
  var fname=req.body.fname;
  var lname=req.body.lname;
  var phone = req.body.phone
  var location = req.body.location
  var address = req.body.address

console.log(req.body);


if(req.user.profile==undefined){  new Profile({
  fname:fname,
  lname:lname,
  phone:phone,
  location:location,
  address:address
}).save().then(x=>{
   User.findOne({_id:req.user.id}).then(u=>{
     u.profile = x.id
     u.save().then(a=>{
       return res.redirect('/users/dashboard')
     })
   })

})}
else{
  Profile.findById({_id:req.user.profile}).then(x=>
  {
    x.fname = fname
    x.lname = lname
    x.location = location
    x.phone = phone
    x.address = address
    x.save().then(z=>{
      return res.redirect('/users/dashboard')
    })
  })
}

})

module.exports  = router

