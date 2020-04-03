const express=require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const User = require('../models/User.js');
const Exchange = require('../models/Exchange.js');
const Profile = require('../models/Profile.js');
const Shelf = require('../models/Shelf.js');


router.get('/confirm/:bookReq/:bookSen',(req,res)=>{
Book.find({Title:req.params.bookReq}).then(x=>{
   Book.find({Title:req.params.bookSen}).then(y=>{
    userReq = req.user._id
    // console.log(y)
     return res.render('confirmexchange',{bookSen:y[0],bookReq:x[0],userReq:userReq});
   });
});
});

router.get('/require/:title',(req,res)=>{
    Book.findOne({Title:req.params.title}).then(x=>{
      userReq = req.user._id
      Shelf.find({user:req.user._id}).select('book -_id').populate('book','Title ImageURLM').then(y=>{
    // console.log(x[0]);
    return res.render('exchangeshelf',{bookSen:y,bookReq:x});
    });
  });
});

router.get('/done/:bookReq/:bookSen',(req,res)=>{
   console.log("entered")
  Book.find({Title:req.params.bookReq}).then(x=>{
   Book.find({Title:req.params.bookSen}).then(y=>{
      console.log(x[0])
      console.log(y[0])
    userReq = req.user._id
    console.log(userReq)
     var n = new Exchange({
        bookSen:y[0]._id,
        bookReq:x[0]._id,
        userReq:userReq
      });
     n.save()
    .then(z=>{
        console.log(z)
        return res.sendStatus(200)
        // console.log(y);
    })
    .catch(err=>{
      console.log(err);
      return res.sendStatus(500)
    })

   });
});
});




module.exports  = router

