const express=require('express');
const router = express.Router();
const Shelf = require('../models/Shelf.js')

// router.get('/nav',function(req,res){
//   return res.render('navbar.ejs')
// })

// router.get('/get',function(req,res){
// Shelf.find({user:req.user.id}).then(x=>{
//   return res.send(x)
// })
//
//
// })
module.exports  = router
