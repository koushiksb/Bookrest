  /*
  All the logic related to lend requests goees here
  */

  const User=require('../models/User')
  const Profile=require('../models/Profile')
  const Payment = require('../models/Payment')
  const Shelf=require('../models/Shelf')
  const Notify=require('../models/Notify')
  const RareRequest=require('../models/RareRequest')
  const express=require('express');
  const router = express.Router();
  const async = require('async')
  var nodemailer = require('nodemailer');
  const isLoggedIn = require('../utils/isLoggedIn')

  //
  // router.get('/shelf',(req,res)=>{
  //   console.log(req.user.email);
  //   Shelf.find({user:req.user.id}).select('book -_id').populate('book','Title').then(x=>{
  //     console.log(x[0]);
  //     return res.render('dummyshelf',{book:x})
  //   })
  //
  //
  // })
  //
  // router.get('/request',isLoggedIn.isLoggedIn,(req,res)=>{
  //     req.session.name = 'asdfgb'
  //     Shelf.find({user:req.user.id}).select('book -_id').populate('book','Title').then(x=>{
  //       console.log(x[0]);
  //       return res.render('dummyviewshelf',{book:x})
  //     })
  //
  //
  // })


  /*
  Api to send a lend request to other users
  */
  router.post('/request',isLoggedIn.isLoggedIn,(req,res)=>{

  console.log('posted');
  console.log(req.body);

  RareRequest.findOne({recipient:req.session.otherUserShelfUserId,book:req.body.bookid,requester:req.user.id}).then(a=>{

      // var datee = new Date()
      // datee.setDate(datee.getDate() + req.body.noofdays);
      var k  = new RareRequest({
        recipient:req.session.otherUserShelfUserId,
        book:req.body.bookid,
        period:req.body.noofdays,
        notetoowner:req.body.notetoowner,
      // '5e5a9d624f4f426bfc199fb1'
        requester:req.user.id,
        status:0

      })
      k.save()
      .then(x=>{
        console.log(x)
        var y = new Notify({
          User:x.recipient,
          Type:'View Read Requests',
          Message:'You got a read request for one of the books in your shelf.'
        }).save()
        console.log('saved');
        return res.sendStatus(200)
      })
      .catch(err=>{
        console.log(err);
        return res.sendStatus(500)
      })

  }

  )


  })

  /*
  Api to see all lend requests Received by the user
  */
  router.get('/viewrequest',isLoggedIn.isLoggedIn,(req,res)=>{

  console.log('found');
  RareRequest.find({recipient:req.user.id,status:0}).populate({path:'requester',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(x=>{
  // RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
  console.log(x);
    return res.render('dummyviewrequest',{requests:x,layout:'navbar2'})
  })
  })

  /*
  Api to see all the requests sent by the user
  */
  router.get('/viewsentrequest',(req,res)=>{

  console.log('found');
  RareRequest.find({requester:req.user.id,status:0}).populate({path:'recipient',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(async (x)=>{
  // RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
  console.log(x);
  console.log('exchange............');
  for(var i = 0; i <  x.length; i++) {
    var y = x[i].recipient
    x[i].recipient = x[i].requester;
    x[i].requester =y;

  }
  console.log(x);
    return res.render('sentRequests',{requests:x,layout:'navbar2'})
  // return res.sendStatus(200)
  })
  })

  /*
  Api to see all the old requests sent by the user
  */
  router.get('/oldrequests',isLoggedIn.isLoggedIn,(req,res)=>{
    RareRequest.find({requester:req.user.id,status:{$ne:0}}).populate({path:'recipient',model:'User',populate:{path:'profile',model:'Profile'}}).populate('book','Title ImageURLL Author').then(async (x)=>{
    // RareRequest.find({recipient:req.user.id,status:0}).populate('book','Title ImageURLS').then(x=>{
    console.log(x);
    console.log('exchange............');
    for(var i = 0; i <  x.length; i++) {
      var y = x[i].recipient
      x[i].recipient = x[i].requester;
      x[i].requester =y;

    }
    console.log(x);
      return res.render('oldrequests',{requests:x,layout:'navbar2'})
    // return res.sendStatus(200)
    })

  })

  /*
  Api to delete the requests sent by the user
  */
  router.post('/deleterequest',isLoggedIn.isLoggedIn,(req,res)=>{

    RareRequest.findOneAndDelete({_id:req.body.id}).then(x=>{
      res.sendStatus(200);
    })
    .catch(err=>{
      res.sendStatus(500)
    })
  })

  /*
  Api to accept or reject requests received by the user
  */
  router.post('/viewrequest',isLoggedIn.isLoggedIn,(req,res)=>{
    console.log('posted');

    console.log(req.body);
    var noOfDays=0;
    RareRequest.find({book:req.body.bookid,recipient:req.user._id}).then(async x=>{
      x = x[x.length-1]
      console.log(x);
      console.log(req.body.status);
      var till_date = new Date();
      noOfDays = x.period;
      till_date.setDate(till_date.getDate() + x.period);
      x.status=Number(req.body.status)
    await  x.save()
      var softcopylink = '';
      var amoutPerDay = 5;
    await  Shelf.findOne({user:req.user.id,book:req.body.bookid}).then(softCopy=>{
        softcopylink = softCopy.softcopy;
        amountPerDay = softCopy.readRequestAmount;
      })
      if(req.body.status == 1){
        var not = new Notify({
          User:x.requester,
          Type:'Read Request Status',
          Message:'Your read request has been accepted.'
        }).save()
        var payinfo = new Payment({
          owner:req.user.id,
          purchaser:req.body.requester,
          book:req.body.bookid,
          status:false,
          amount:amountPerDay*noOfDays

        })
        await payinfo.save();
        var add  = new Shelf({
          book:req.body.bookid,
          user:req.body.requester,
          owner:'1',
          paid:0,
          softcopy:softcopylink,
          period:till_date

        });
        add.save().then(async a=>{
          await User.findOne({id:req.body.requester}).then(d=>{
                    var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'bookrest.com@gmail.com',
                pass: 'ead@0139'
            }
            });
                    var mailOptions = { from: 'no-reply@Bookrest.com', to: newUser.email, subject: 'Lend Request Status', text: 'Hello,\n\n' + 'Your lend request is accepted, Please finish payment to read the book: \nhttp:\/\/' + req.headers.host + '\/payments/pending' + '.\n' };
                    transporter.sendMail(mailOptions, function (err) {
                        if (err) { return res.status(500).send({ msg: err.message }); }

          })
  });
  });
          return res.sendStatus(200)


      }else{
        var not = new Notify({
          User:x.requester,
          Type:'Read Request Status',
          Message:'Your read request has been declined.'
        }).save()
        console.log('jhgfdsa');
        return res.sendStatus(200)

      }
    })
    .catch(err=>{
      console.log(err);
      return res.sendStatus(500)
    })


  })


  module.exports  = router
  
