const express=require('express');
const router = express.Router();
const User=require('../models/User');
const Shelf=require('../models/Shelf');
const Book=require('../models/Book');
const multer = require('multer');
var stripe = require("stripe")("sk_test_HjrHIdQ8B5TgrtyYDRHETh9c00FoxUGVPv");

// store and validation
const multerconf = {
  storage:multer.diskStorage({
    destination:function(req,file,next){
      // const ext = file.mimetype.split('/')[0];
      // if(ext === 'image'){
        next(null,'./static/coverimages');
      // }
      // else{
      //   next(null,'./static/pdf');
      // }
    },
    filename:function(req,file,next){
      const ext = file.mimetype.split('/')[1];
      next(null,file.fieldname+'.'+Date.now()+'.'+ext)
    }
  }),
}

router.get('/view',(req,res)=>{

  Shelf.find({user:req.user._id}).select('book -_id').populate('book','Title ImageURLL').then(x=>{
    // console.log(x);
    Shelf.find({user:req.user._id}).then(y=>{
      // console.log(y);
      return res.render('shelf1',{book:x,layout:'navbar2',owner:y});
    });
  })

});

router.get('/addbook',(req,res)=>{

  res.render('addbook');

});

// router.post('/check',multer(multerconf).single('pdf'),(req,res)=>{
//   console.log(req.file);
//   res.send('this is post the pdf upload');
// });

function path(req){
  if(req.file){
    return '../static/coverimages/'+req.file.filename;
  }
  else{
    return '../static/pics/image_placeholder.jpg';
  }
}

router.post('/addbook',multer(multerconf).single('photo'),(req,res)=>{

  console.log(req.file);

  Book.findOne({Title:req.body.bookname}).then(re=>{
    if(re === null){
      console.log('in NUll');
      var n = new Book({
        Publisher:req.body.publisher,
        Title:req.body.bookname,
        Author:req.body.author,
        YearOfPublication:req.body.year,
        ImageURLS: path(req)
      });
      n.save().then(x=>{
        console.log('saved to books collection successfully');
        // console.log(x);
        var m = new Shelf({
          user:req.user._id,
          book:x._id
        });
        m.save().then(y=>{
          console.log('saved to Shelves collection successfully');
          res.redirect('/shelf/view');
          // console.log(y);
        })
      });
    }
    else{
      Shelf.findOne({user:req.user._id,book:re.id}).then(sh=>{
        if(sh === null){
          var m = new Shelf({
            user:req.user._id,
            book:re._id
          });
          m.save().then(y=>{
            console.log('saved to Shelves collection successfully');
            res.redirect('/shelf/view');
            // console.log(y);
          })
        }
        else{
          // alredy added this book
          res.redirect('/shelf/view');
        }
      });


    }
  });

});

router.get('/viewbook/:title',(req,res)=>{

  Book.findOne({Title:req.params.title}).then(x=>{
    res.render('viewbook',{image:x.ImageURLL,title:x.Title,author:x.Author,id:x._id,layout:'navbar2.ejs'});
  });

});

router.get('/deletebook/:title',(req,res)=>{
  Book.findOne({Title:req.params.title}).then(x=>{
    Shelf.findOneAndRemove({user:req.user._id,book:x._id}).then(y=>{
      res.redirect('/shelf/view');
    });
  })
});


router.post('/charge',(req,res)=>{
  var token = req.body.stripeToken;
  var chargeAmount = req.body.chargeAmount;
  var bookid = req.body.id;
  var charge = stripe.charges.create({
    amount : chargeAmount,
    currency : "inr",
    source : token,
  }, function(err,charge){
    if(err){
      console.log("Your card was declined");
    }
}).then((hh)=>{
  // add bookid to the users subscription list
  // console.log(bookid);
  Shelf.findOneAndUpdate({user:req.user._id,book:bookid},{owner:0}).then(z=>{
    res.redirect('/shelf/view');
  });
});
});

module.exports = router;
