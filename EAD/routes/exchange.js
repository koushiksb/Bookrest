  /*
  All the logic related to exchange books goes here
  */

  const Book = require('../models/Book.js');
  const User = require('../models/User.js');
  const Exchange = require('../models/Exchange.js');
  const Profile = require('../models/Profile.js');
  const Shelf = require('../models/Shelf.js');
  const Review = require('../models/Review.js');
  const express=require('express');
  const Notify = require('../models/Notify.js');
  const router = express.Router();
  const isLoggedIn = require('../utils/isLoggedIn');

  /*
  Api to get confirmation for exchange by the user
  */
  router.get('/confirm/:bookReq/:bookSen',(req,res)=>{
  Book.find({Title:req.params.bookReq}).then(x=>{
     Book.find({Title:req.params.bookSen}).then(y=>{
      userReq = req.user._id
      // console.log(y)
       return res.render('confirmexchange',{bookSen:y[0],bookReq:x[0],userReq:userReq});
     });
  });
  });

  /*
  api to show user shelf to select book he wants to give away
  */
  router.get('/require/:title',isLoggedIn.isLoggedIn,(req,res)=>{
      Book.findOne({Title:req.params.title}).then(x=>{
        userReq = req.user._id
        Shelf.find({user:req.user._id,owner:{$exists:false}}).select('book -_id').populate('book','Title ImageURLM').then(y=>{
      // console.log(x[0]);
      return res.render('exchangeshelf',{bookSen:y,bookReq:x});
      });
    });
  });

  /*
  Creating a exchange request by the user
  */
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

  /*
  Api to view all the exchange requests raised by the user
  */
  router.get('/mytrades',isLoggedIn.isLoggedIn,(req,res)=>{
    Exchange.find({userReq:req.user.id,status:false}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
    .then(x=>{
      return res.render('myexchanges',{requests:x,layout:"navbar2"})
    })
    .catch(err=>{
      console.log(err);
    })

  })

  /*
  Api to view trades done by the user
  */
  router.get('/tradescompleted',isLoggedIn.isLoggedIn,(req,res)=>{
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

  /*
  Api to view ongoing exchange requests
  */
  router.get('/ongoing',isLoggedIn.isLoggedIn,(req,res)=>{
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

  /*
  Api to update exchange request when user receives the book
  */
  router.post('/ongoing',(req,res)=>{
    Exchange.findOne({_id:req.body.id}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}})
    .then(x=>{
      console.log(req.user.id)
      console.log(x.userReq._id)
      if(x.userReq._id == req.user.id){
        x.exchangeReq = true
        console.log('bskjs')
        var n = new Notify({
          User:x.userAcc,
          Type:'Book Received',
          Message:x.userReq.profile.fname+' '+x.userReq.profile.lname+' has received the book you sent.'
        }).save()
      }else{
        x.exchangeSen = true
          var n = new Notify({
          User:x.userReq,
          Type:'Book Received',
          Message:x.userAcc.profile.fname+' '+x.userAcc.profile.lname+' has received the book you sent.'
        }).save()
        console.log('hhknjn')
      }
      x.save()
      .then(a=>{
        console.log(a)
        if(a.exchangeReq && a.exchangeSen){
          console.log("gjhbcdhd")
          var n = new Notify({
            User:a.userAcc,
            Type:'Book Exchanged',
            Message:'Exchange with '+a.userReq.profile.fname+' '+a.userReq.profile.lname+' has been done. Bookshelf is updated.'
          }).save()
          var n = new Notify({
            User:a.userReq,
            Type:'Book Exchanged',
            Message:'Exchange with '+a.userAcc.profile.fname+' '+a.userAcc.profile.lname+' has been done. Bookshelf is updated.'
          }).save()
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

  /*
  Api to swap the books in shelf when exchange is completed
  */
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

  /*
  Api to update the exchange request when user accepts the exchange request
  */
  router.post('/mytrades',(req,res)=>{
    Exchange.findOneAndDelete({_id:req.body.id})
    .then(x=>{
      console.log(x);
    })
    .catch(err=>{
      console.log(err);
    })

  })

  /*
  Api to view all the exchange requests
  */
  router.get('/tradepage',(req,res)=>{
    var books = [];
    // Shelf.find({user:req.user.id}).populate('book','_id').then(y=>{
    //   for(var i=0;i<y.length;i++){
    //     books.push(y[i].book.id)
    //   }
    //   console.log(books);
    // })

    Exchange.find({status:false}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL')
    .then(x=>{
      var gen = [];
      for(var i=0;i<x.length;i++){
        if (x[i].userReq.id != req.user._id){
          gen.push(x[i]);
        }
      }
      var locations = ['Bangalore','Bhuvaneshwar','Chennai','Delhi','Goa','Hyderabad','Jabalpur','Kolkatta','Lucknow','Mumbai',
      'Munnar','Mysore','Nagpur','Noida','Patna','Pondicherry','Pune','Raipur','Shimla','Trichy','Vijayawada','Vishakhapatnam',
      'Warangal','Tirupati'];
      console.log(gen)
      return res.render('viewtrades',{exchange:gen,locations:locations,layout:"navbar2"})
    })
  })

  /*
  Api to filter data on trades page
  */
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

  /*
  Api to view a particular trade request
  */
  router.get('/viewtrade/:id',(req,res)=>{
    Exchange.findOne({_id:req.params.id}).populate({path:'userReq',model:'User',populate:{path:'profile',model:'Profile'}}).populate('bookReq bookSen','Title ImageURLL Author')
    .then(x=>{
      return res.render('tradeview',{exchange:x,layout:"navbar2"})
    })
  })


  /*
  Api to accept the exchange requests
  */
  router.get('/accept/:id',isLoggedIn.isLoggedIn,(req,res)=>{
    Exchange.findOneAndUpdate({_id:req.params.id},{status:true,userAcc:req.user.id}).then(async(x)=>{
      console.log(x);
    await Exchange.findOne({_id:req.params.id}).populate({path:'userAcc',model:'User',populate:{path:'profile',model:'Profile'}})
    .then(async(y)=>{
        var n = new Notify({
        User:y.userReq,
        Type:'Exchange Accepted',
        Message:y.userAcc.profile.fname+' '+y.userAcc.profile.lname+' has accepted to exchange the book that you offered.'
      }).save()
       return res.redirect('/exchange/ongoing')
    })
  })
  })

  //
  // router.get('/trail',(req,res)=>{
  //   Book.find({}).then(x=>{
  //     for (var i=0; i<x.length; i++){
  //       // var b_id = x[i]._id;
  //       // var rate = 0;
  //       // var t_r = 0
  //       // await Review.find({book:b_id}).then(z=>{
  //       //   var sum = 0;
  //       //   t_r = z.length
  //       //   for (var l=0;l<z.length;l++){
  //       //     sum = sum + Number(z[l].rating);
  //       //   }
  //       //   sum = (sum/z.length);
  //       //   rate =  sum;
  //       // })
  //       x[i]["Hardcopy"] = undefined;
  //       // x[i].Rating = rate;
  //       // x[i].Treviews = t_r;
  //       console.log(x[i])
  //       x[i].save()
  //     }
  //     // console.log(x[0])
  //   })
  //   return res.sendStatus(200)
  // })



  module.exports  = router
