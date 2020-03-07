const express=require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const User = require('../models/User.js');
const Exchange = require('../models/Exchange.js');
const Profile = require('../models/Profile.js');
const Shelf = require('../models/Shelf.js');


router.post('/addexchange',(req,res)=>{
Book.find({ISBN:'3442353866'}).then(x=>{
      console.log(x);
      var k  = new Exchange({
        bookReq:req.bookid1,
// '5e5a9d624f4f426bfc199fb1'
        bookSen:x[0]._id,
        userReq:req.user.id,
        status:false
      })
      k.save()
            .then(x=>{
              console.log('k');
              return res.sendStatus(200)
            })
            .catch(err=>{
              console.log(err);
              return res.sendStatus(500)
            })
})
})

router.get('/require',(req,res)=>{
    user:req.user
    Book.find({ISBN:'3442353866'}).then(x=>{
      console.log(x);
      // return res.render('booktrade2',{bookid1:x._id})
      return res.send(x[0].id)
    })
})



module.exports  = router

