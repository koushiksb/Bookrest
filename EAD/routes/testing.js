const express=require('express');
const router = express.Router();
const Shelf = require('../models/Shelf.js')
var PDFImage = require("pdf-image").PDFImage;
var pdfjs = require('./import.js')

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

router.get('/upload',(req,res)=>{
  return res.render('testupload')
})

router.post('/upload',(req,res)=>{
//
  var fs      = require('fs');
var path    = require('path');
var pdf2img = require('pdf2img');

var input   = req.files[0].path;

pdf2img.setOptions({
  type: 'png',                                // png or jpg, default jpg
  size: 1024,                                 // default 1024
  density: 600,                               // default 600
  outputdir: req.files[0].destination, // output folder, default null (if null given, then it will create folder name same as file name)
  outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
  page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
});

pdf2img.convert(input, function(err, info) {
  if (err) console.log(err)
  else console.log(info);
});
  return res.sendStatus(200)

  var pdfImage = new PDFImage("http://127.0.0.1:3000/uploads/books/License.pdf5e5a9d624f4f426bfc199fb0.pdf"  );
  pdfImage.convertFile(0).then(function (imagePaths) {
    // [ /tmp/slide-0.png, /tmp/slide-1.png ]
    console.log(imagepaths);
    return res.sendStatus(200)
  });
// pdfjs.getDocument('../uploads/books/License.pdf5e5a9d624f4f426bfc199fb0.pdf')
//
// return res.sendStatus(200)
})


module.exports  = router
