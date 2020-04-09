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
        return res.redirect('/exchange/mytrades')
        // console.log(y);
    })
    .catch(err=>{
      console.log(err);
      return res.sendStatus(500)
    })

   });
});
});

// router.get('/alltrades',(req,res)=>{
//   Exchange.find({})
//   return res.render('viewtrades')
// })
router.get('/mytrades',(req,res)=>{
  Exchange.find({userReq:req.user.id,status:false}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
  .then(x=>{
    return res.render('myexchanges',{requests:x,layout:"navbar2"})
  })
  .catch(err=>{
    console.log(err);
  })

})

router.post('/mytrades',(req,res)=>{
  Exchange.findOneAndDelete({_id:req.body.id})
  .then(x=>{
    console.log(x);
  })
  .catch(err=>{
    console.log(err);
  })

})

router.get('/tradepage',(req,res)=>{
  Exchange.find({status:false}).then(async(x)=>{
    var list = []
    console.log(x[0])
    for(var i=0;i<x.length;x++){
      var gen = {}
      await Book.findOne({_id:x[i].bookReq}).then(b1=>{
        gen['bookReq']=b1;
      })
      await Book.findOne({_id:x[i].bookSen}).then(b2=>{
        gen['bookSen']=b2;
      })
      await User.findOne({_id:x[i].userReq}).then(async(u1)=>{
        await Profile.findOne({_id:u1.profile}).then(p1=>{
          gen['profile']=p1;
        })
      })
      list.push(gen)
    }
    // return res.sendStatus(200)
    return res.render('viewtrades',{exchange:list,layout:"navbar2"})
  })
})


module.exports  = router
