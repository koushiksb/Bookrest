const express=require('express');
const router = express.Router();
const Book=require('../models/Book')
const User=require('../models/User')

router.get('/nav',function(req,res){
  return res.render('navbar.ejs')
})

router.get('/get',function(req,res){


Book.find({}).then(x=>{
  console.log(x[0]);
})
return res.sendStatus(200)
})


module.exports  = router
