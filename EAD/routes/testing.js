const express=require('express');
const router = express.Router();
const Book = require('../models/Book.js')

router.get('/nav',function(req,res){
  return res.render('navbar.ejs')
})

router.get('/get',function(req,res){
	var nbook = new Book({
		ISBN:'524512451',
		Title:'sdfcgvhbjnkm',
		Author:'sdfgh',
		YearOfPublication:'ijuhygtf',
		Publisher:'lkjhg',
		ImageURLS:'sdrfgh',
		ImageURLM:'jgfd',
		ImageURLL:'dsfdgfgh'

	}) 
	nbook.save().then(x=>{
		console.log('done')
	})
	
  return res.sendStatus(200)
})
module.exports  = router
