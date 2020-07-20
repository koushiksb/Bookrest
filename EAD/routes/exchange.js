const express=require('express');
const router = express.Router();
const Book = require('../models/Book.js');
const User = require('../models/User.js');
const Exchange = require('../models/Exchange.js');
const Profile = require('../models/Profile.js');
const Shelf = require('../models/Shelf.js');
const Review = require('../models/Review.js');
const isLoggedIn = require('../utils/isLoggedIn');

router.get('/confirm/:bookReq/:bookSen',(req,res)=>{
Book.find({Title:req.params.bookReq}).then(x=>{
   Book.find({Title:req.params.bookSen}).then(y=>{
    userReq = req.user._id
    // console.log(y)
     return res.render('confirmexchange',{bookSen:y[0],bookReq:x[0],userReq:userReq});
   });
});
});

router.get('/require/:title',isLoggedIn.isLoggedIn,(req,res)=>{
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

router.get('/tradescompleted',(req,res)=>{
  Exchange.find({userReq:req.user.id,status:true,exchangeReq:true,exchangeSen:true}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
  .then(x=>{
    console.log(x.length)
    Exchange.find({userAcc:req.user.id,status:true,exchangeReq:true,exchangeSen:true}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
    .then(y=>{
      console.log(y.length)
      return res.render('tradescompleted',{requests:x,accepts:y,layout:"navbar2"})

    })
    .catch(err=>{
      console.log(err);
    })
  })
  .catch(err=>{
    console.log(err);
  })

})

router.get('/ongoing',(req,res)=>{
  Exchange.find({userReq:req.user.id,status:true,$or:[{exchangeReq:false},{exchangeSen:false}]}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
  .then(x=>{
    console.log(x);
    Exchange.find({userAcc:req.user.id,status:true,$or:[{exchangeReq:false},{exchangeSen:false}]}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
    .then(y=>{
      console.log(y);
    return res.render('ongoing',{requests:x,accepts:y,layout:"navbar2"})
    })
    .catch(err=>{
      console.log(err);
    })

  })
  .catch(err=>{
    console.log(err);
  })

})

router.post('/ongoing',(req,res)=>{
  Exchange.findOne({_id:req.body.id})
  .then(x=>{
    if(x.userReq == req.user.id){
      x.exchangeReq = true
    }else{
        x.exchangeSen = true
    }
    x.save()
    .then(a=>{
      console.log(a)
      if(a.exchangeReq && a.exchangeSen){
        console.log("gjhbcdhd")
        return res.redirect('/exchange/exchangeshelf/'+a._id)
      }
      else{
      return res.sendStatus(200)
      }
    })
    .catch(err=>{
      console.log(err);
    })
  })
  .catch(err=>{
    console.log(err);
  })
})


router.get('/exchangeshelf/:id',(req,res)=>{
  Exchange.findOne({_id:req.params.id}).then(x=>{
    var u1 = x.userReq
    var u2 = x.userAcc
    var b1 = x.bookReq
    var b2 = x.bookSen
    Shelf.findOneAndUpdate({user:u1,book:b2},{book:b1}).then(x=>{
      console.log(x);
    })
    Shelf.findOneAndUpdate({user:u2,book:b1},{book:b2}).then(y=>{
      console.log(y);
    })
    return res.redirect('/exchange/tradescompleted')
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
  var books = [];
  Shelf.find({user:req.user.id}).populate('book','_id').then(y=>{
    for(var i=0;i<y.length;i++){
      books.push(y[i].book.id)
    }
    console.log(books);
  })

  Exchange.find({status:false}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL')
  .then(x=>{
    var gen = [];
    for(var i=0;i<x.length;i++){
      // if (books.includes(x[i].bookReq.id)){
        gen.push(x[i]);
      // }
    }
    var locations = ['Bangalore','Bhuvaneshwar','Chennai','Delhi','Goa','Hyderabad','Jabalpur','Kolkatta','Lucknow','Mumbai',
    'Munnar','Mysore','Nagpur','Noida','Patna','Pondicherry','Pune','Raipur','Shimla','Trichy','Vijayawada','Vishakhapatnam',
    'Warangal','Tirupati'];
    return res.render('viewtrades',{exchange:gen,locations:locations,layout:"navbar2"})
  })
})

router.post('/filtertradepage',(req,res)=>{
  console.log(req.body.genre)
  var genreFilters=[];
  if(req.body.genre.all!=='true'){
    Object.entries(req.body.genre).forEach((item, i) => {
    console.log(item)
    if(item[1]==='true' && item[0]!=='all' ){
      genreFilters.push(item[0])
    }
    })
  }else{
    genreFilters = ['Fantasy','Fiction','Fairytale','History','Mystery','Novel','Poetry','Romance','Thriller'];
  }
  console.log(req.body.location)
  var location=[];
  if(req.body.location.all!=='true'){
    Object.entries(req.body.location).forEach((item, i) => {
    console.log(item)
    if(item[1]==='true' && item[0]!=='all' ){
      location.push(item[0])
    }
    })
  }else{
    location = ['bangalore','bhuvaneshwar','chennai','delhi','goa','hyderabad','jabalpur','kolkatta','lucknow','mumbai',
    'munnar','mysore','nagpur','noida','patna','pondicherry','pune','raipur','shimla','trichy','vijayawada','vishakhapatnam',
    'warangal','tirupati'];
  }
  Exchange.find({status:false}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Genre')
  .then(x=>{
    var gen = [];
    console.log(x);
    for(var i=0;i<x.length;i++){
      console.log(x[i].userReq.profile.location)
      if (location.includes(x[i].userReq.profile.location.toLowerCase())){
        if (genreFilters.includes(x[i].bookReq.Genre) || genreFilters.includes(x[i].bookSen.Genre)){
          gen.push(x[i]);
        }
      }
    }
    return res.send({exchange:gen})
})
})


router.get('/viewtrade/:id',(req,res)=>{
  Exchange.findOne({_id:req.params.id}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
  .then(x=>{
    return res.render('tradeview',{exchange:x,layout:"navbar2"})
  })
})



router.get('/accept/:id',(req,res)=>{
  Exchange.findOneAndUpdate({_id:req.params.id},{status:true,userAcc:req.user.id}).then(x=>{
    console.log(x);
  })
  return res.redirect('/exchange/ongoing')
})


router.get('/trail',(req,res)=>{
  Book.find({}).then(x=>{
    for (var i=0; i<x.length; i++){
      // var b_id = x[i]._id;
      // var rate = 0;
      // var t_r = 0
      // await Review.find({book:b_id}).then(z=>{
      //   var sum = 0;
      //   t_r = z.length
      //   for (var l=0;l<z.length;l++){
      //     sum = sum + Number(z[l].rating);
      //   }
      //   sum = (sum/z.length);
      //   rate =  sum;
      // })
      x[i]["Hardcopy"] = undefined;
      // x[i].Rating = rate;
      // x[i].Treviews = t_r;
      console.log(x[i])
      x[i].save()
    }
    // console.log(x[0])
  })
  return res.sendStatus(200)
})



module.exports  = router
