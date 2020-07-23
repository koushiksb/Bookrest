/*

All the logic related to
***user authentication(Login and Signup)***
***Email verification and forgot password***
***User profile***
***Dashboard***
***Search in dashboard***
is in this code

*/



const Genre = require('../models/Genre.js');
const Book = require('../models/Book.js');
const User=require('../models/User')
const Token=require('../models/Token')
const Profile=require('../models/Profile')
const Review=require('../models/Review')
const express=require('express');
const { check, validationResult } = require('express-validator');
const bodyparser=require('body-parser');
const bcrypt=require('bcryptjs');
const passport=require('passport');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const router = express.Router();
const multer = require('multer');
const gpath = require('path');
const Notify = require('../models/Notify.js');
const MiniSearch = require('minisearch')
var urlencodedparser=bodyparser.urlencoded({extended:true});
bodyParser = require('body-parser').json();

/*
Multer middleware to upload user profile image
*/

const userimageconf = {
    storage:multer.diskStorage({
        destination:function(req,file,next){
      // const ext = file.mimetype.split('/')[0];
      // if(ext === 'image'){
            next(null,gpath.join(__dirname,'../static/pics/'));
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

/*
function to get the file storage path
 */
function path(req){
    if(req.file){
        return 'static/pics/'+req.file.filename;
    }else{
        return '';
    }
                  }


/*
user logged in middleware
 */

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/users/login');
                                      }

/*
middleware to redirect to dashboard from login page if user is already loggedIn
*/
function IsAuth(req,res,next){
    if(!req.isAuthenticated()){
        return next()
                            }
    res.redirect('/users/dashboard')
                                }

/*
route to the login page
 */
router.get('/login',IsAuth,(req,res)=>{return res.render('login')});
/*
route to the signup page
*/
router.get('/signup',IsAuth,(req,res)=>res.render('signup',{errors:[],check:0}));
/*
Api to check if user is alredy registered and entering a valid email in login page
*/
router.post('/checkemail',function (req,res){
    console.log(';checking');
    console.log(req.body)
    User.findOne({email:req.body.email}).then(user=>{
        console.log(user);
        if(user==null){
            return res.send('1')
            console.log(user)
        }else{
            if(user.method=='normal'){
            console.log(user);
            return res.send('0')
        }else{
            return res.send('-1')
              }
        }
                                                        })
                                              });

/*
Api to store newly registered user data
*/
router.post('/signup',urlencodedparser,[
                                          check('password').not().isEmpty().withMessage('password is required'),
                                          check('password').isLength({min:6}).withMessage('Please enter a password at least 6 character.'),
                                          check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,).withMessage('Passwordmust contain one uppercase letter one lower case letter and one special character  '),
                                          check('password1').not().equals('password').withMessage('Passwords do not match'),
                                          check("email").not().isEmpty().withMessage('Email is required'),
                                          check('email').isEmail().withMessage('Enter valid email'),
],async (req,res)=>{
    console.log(req.body);

    const password=req.body.password;
    const password1=req.body.password1;
    const email=req.body.email;

    let errors =validationResult(req);


    await User.findOne({email:email}).then(function(user){
        console.log(user)
        if (user!=null){
            console.log('Email already in use')
            error = {
                param:'email',
                msg:'Email already in use',
                value:email

                    }
            errors.errors.push(error)
                        }
                                                          });


    if (errors.errors.length>0){
        return res.render('signup.ejs',{
                                          errors:errors

                                        });
    }else{

    let newUser = new User({

        email:email,
        password:password,
        method:'normal'

                            });

    bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>
    {
        if (err){
            console.log(err)
              } ;
        newUser.password=hash;
        console.log('created')

        newUser.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }

        // Create a verification token for this user
            var token = new Token({ _userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });

        // Save the verification token
            token.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }

            // Send the email
                var transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                      user: 'bookrest.com@gmail.com',
                      pass: 'ead@0139'
                          }
                                                                });
                var mailOptions = { from: 'no-reply@Bookrest.com', to: newUser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users/confirmation\/' + token.token + '.\n' };
                transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }

                    return res.render('msg',{msg:newUser.email,msg1:'A verification email has been sent to'});
            });
        });
    })


}))

  // return res.redirect('/users/login');
  }

});

/*
User login logic
uses passport login in config folder
*/
router.post('/login',IsAuth,urlencodedparser,(req,res,next)=>{
    console.log(req.body)
    passport.authenticate('local',{
        successRedirect:'/users/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
                                    })(req,res,next);

});


/*
Logout api
*/
router.get('/logout',isLoggedIn,(req,res)=>{
    req.logout()
    res.redirect('/users/dashboard')
})

/*
notification
*/
router.get('/notify',isLoggedIn,(req,res)=>{
  var unseen=[]
  var seen = []
  Notify.find({User:req.user.id}).then(y=>{
    // console.log(y)
    for (i=0;i<y.length;i++){
      if(y[i].Status){
        seen.push(y[i])
      }
      else{
        unseen.push(y[i])
      y[i].Status = true
      y[i].save()
    }
    }
    console.log(seen)
    return res.render('notify',{unseen:unseen,seen:seen,len:y.length,layout:'navbar2.ejs'})
  })
})

/*
Dashboard api
*/
router.get('/dashboard',async (req,res)=>{
    console.log(req.isAuthenticated());
    if(req.user){
        if(req.user.profile==undefined){
            var genre={
                Romance:false,
                History:false,
                Novel:false,
                Thriller:false,
                FairyTale:false,
                Mystery:false,
                Fiction:false,
                Poetry:false,
                Fantasy:false

                        }

            return res.render('profile1',{user:req.user.email,pro:null,genre:genre})
        }else{
            var pop = {};
            Book.find({Class:"Rare"}).lean().then(f=>{
                pop['Rare']=f.slice(0,8);
                                                      })
            Book.find({Class:"Popular"}).lean().then(f=>{
                pop['Popular']=f.slice(0,8);
                                                        })
            Genre.find({}).then(async(x)=>{
          // console.log(x[0])
            var lis_genre = x;
            var arrayLength = x.length;
            var gen = {};
            for (var i = 0; i < arrayLength; i++) {
                var g = x[i]['Genre'];
            // console.log(g);
                await Book.find({Genre:g}).lean().then(y=>{
              // console.log(y[0])
                    gen[g]=y.slice(0,12);
              // console.log(gen)
              // console.log(dic)
                                                            })
                                                    }
          // console.log(gen)
                return res.render('dashboard',{pop:pop,user:req.user.email,genre:lis_genre,books:gen,layout:'navbar2.ejs'})
        })  // return res.sendStatus(200)
     }
    }else{
        var pop = {};
        Book.find({Class:"Rare"}).lean().then(f=>{
            pop['Rare']=f;
        })
        Book.find({Class:"Popular"}).lean().then(f=>{
            pop['Popular']=f;
        })
        Genre.find({}).then(async(x)=>{
       // console.log(x[0])
            var lis_genre = x;
            var arrayLength = x.length;
            var gen = {};
            for (var i = 0; i < arrayLength; i++) {
                var g = x[i]['Genre'];
         // console.log(g);
                await Book.find({Genre:g}).lean().then(y=>{
           // console.log(y[0])
                    gen[g]=y.slice(0,12);
           // console.log(gen)
           // console.log(dic)
                                                          })
                                                  }
       // console.log(gen)
            return res.render('dashboard',{pop:pop,genre:lis_genre,books:gen,layout:'navbar.ejs'})
     })  // return res.sendStatus(200)


   }
})
/*
Genre wise books list
*/
  router.get('/seebooks/:genre',(req,res)=>{
    Book.find({Genre:req.params.genre}).then(x=>{
      // console.log(x[0])
      return res.render('genrebooks',{books:x,layout:'navbar2.ejs'})
    })
  })
/*
Popularity wise books list
*/
  router.get('/seebks/:pop',(req,res)=>{
    Book.find({Class:req.params.pop}).then(x=>{
      // console.log(x[0])
      return res.render('popbooks',{books:x,layout:'navbar2.ejs'})
    })
  })
/*
dashboard search api
*/
  router.post('/search',(req,res)=>{
    var str = req.body.search;
    var arr = str.split(" ");
    arr = arr.toLocaleString().toLowerCase().split(',');
    var gen=[];
    Book.find({}).lean().then(async(x)=>{
      var gen = [];
      x.forEach((item, i) => {
        item['id'] = i+1;
      });

      console.log(x[0])
      let miniSearch = new MiniSearch({
          fields: ['Title', 'Author'], // fields to index for full-text search
          storeFields: ['Title','Author','ImageURLM'],
          searchOptions:{
              fuzzy:0.4,
              prefix:true
                          } // fields to return with search results

                                      })
      miniSearch.addAll(x);
      gen = miniSearch.search(str);

      // for(var i=0;i<x.length;i++){
      //   var quer = x[i]['Publisher']+' '+x[i]['Title']+' '+x[i]['Author']+' '+x[i]['YearOfPublication'];
      //   var quer = quer.toLowerCase()
      //   var query = quer.toLowerCase().split(" ");
      //   if(arr.some(item => quer.includes(item))){
      //     gen.push(x[i])
      //   }

      // console.log(gen[0])
      return res.render('search',{books:gen,layout:'navbar2.ejs',query:str,allbooks:x})
    })
  })


/*
Api for viewing profile page
*/
  router.get('/profile',(req,res)=>{

    Profile.findById({_id:req.user.profile}).then(x=>{
      console.log(x);
      var genre={
        Romance:false,
        History:false,
        Novel:false,
        Thriller:false,
        FairyTale:false,
        Mystery:false,
        Fiction:false,
        Poetry:false,
        Fantasy:false

      }
      x.favouriteGenre.forEach((item, i) => {
        genre[item] = true;
      });
      console.log(genre)
      return res.render('profile1',{user:req.user.email,genre:genre,pro:x,layout:'navbar2'})
    })


  })


  /*
  Api for updating profile information
  */

  router.post('/profile',multer(userimageconf).single('profilepic'),(req,res)=>{
    console.log('posted');

    var fname=req.body.fname;
    var lname=req.body.lname;
    var phone = req.body.phone
    var location = req.body.location
    var address = req.body.address
    var favouriteGenre = req.body.Genre;
    var propic = path(req)
  // Object.keys(req.body).forEach((item, i) => {
  //   if(req.body[item]==='on'){
  //     favouriteGenre.push(item);
  //   }
  // });

    console.log(req.body);
    console.log(req.file)

    if(req.user.profile==undefined){  new Profile({
      fname:fname,
      lname:lname,
      phone:phone,
      location:location,
      address:address,
      favouriteGenre:favouriteGenre,
      profilepic:propic
    }).save().then(x=>{
       User.findOne({_id:req.user.id}).then(u=>{
         u.profile = x.id
         u.save().then(a=>{
           return res.redirect('/users/dashboard')
         })
       })

    })}
    else{
      Profile.findById({_id:req.user.profile}).then(x=>
      {
        x.fname = fname
        x.lname = lname
        x.location = location
        x.phone = phone
        x.address = address
        x.favouriteGenre=favouriteGenre,
        x.profilepic=propic
        x.save().then(z=>{
          return res.redirect('/users/profile')
        })
      })
    }

  })

  /*
  Api for email verification on clicking the verification link in email
  */

  router.get('/confirmation/:token',function (req, res, next) {
    // console.log(req)
    //   req.assert('email', 'Email is not valid').isEmail();
    //   req.assert('email', 'Email cannot be blank').notEmpty();
    //   req.assert('token', 'Token cannot be blank').notEmpty();
    //   req.sanitize('email').normalizeEmail({ remove_dots: false });
    //
    //   // Check for validation errors
    //   var errors = req.validationErrors();
    //   if (errors) return res.status(400).send(errors);
  console.log('came')
      // Find a matching token
      Token.findOne({ token: req.params.token }, function (err, token) {
          if (!token) return res.render('msg',{  msg: 'We were unable to find a valid token. Your token my have expired.',msg1:'Not Verified' });

          // If we found a token, find a matching user
          User.findOne({ _id: token._userId }, function (err, user) {
              if (!user) return res.render('msg',{ msg: 'We were unable to find a user for this token.',msg1:'Not Verified' });
              if (user.isVerified) return res.render('msg',{  msg: 'This user has already been verified.',msg1:'Not Verified' });

              // Verify and save the user
              user.isVerified = true;
              user.save(function (err) {
                  if (err) { return res.render('msg',{ msg: err.message,msg1:'Not Verified' }); }
                return res.render('msg',{msg:"The account has been verified. Please log in.",msg1:'Verified'});
              });
          });
      });
  });
  /*
  Api for resending the verification link
  */

  router.post('/resend',function(req,res,next){

    // req.assert('email', 'Email is not valid').isEmail();
    //   req.assert('email', 'Email cannot be blank').notEmpty();
    //   req.sanitize('email').normalizeEmail({ remove_dots: false });
    //
    //   // Check for validation errors
    //   var errors = req.validationErrors();
    //   if (errors) return res.status(400).send(errors);

      User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
          if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

          // Create a verification token, save it, and send email
          var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

          // Save the token
          token.save(function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }

              // Send the email
              var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
              var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
              transporter.sendMail(mailOptions, function (err) {
                  if (err) { return res.status(500).send({ msg: err.message }); }
                  res.status(200).send('A verification email has been sent to ' + user.email + '.');
              });
          });

      });

  })
  /*
  Api for google authentication to fetch user data
  */
  router.get('/google',passport.authenticate('google',{
    scope:['profile','email']
  }));
  /*
  Api for google authentication successful redirection
  */
  router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
    console.log('im here');
    return res.redirect('/users/dashboard')
  })

  /*
  Api for forgot password
  */
  router.get('/forgot', function(req, res) {

    res.render('forgot');
  });
  /*
  Api for forgot password send email verification link
  */
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        console.log(req.body);
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('./forgot');
          }
  console.log('sfa');
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            console.log('saved');
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true, // use SSL
              auth: {
                  user: 'bookrest.com@gmail.com',
                  pass: 'ead@0139'
                    }
                                                            });

        var mailOptions = {
          to: user.email,
          from: 'Bookrest@noreply.com',
          subject: 'Bookrest Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host +'/users/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          console.log('sagdf');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.render('msg',{msg1:'Reset Password',msg:'Reset link has been sent to your email '});
      console.log('mailsent');
    });
  });

  /*
  Api to check emailed veficiation token
  */
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('./forgot');
      }
      res.render('reset');
    });
  });

  /*
  Api to check emailed veficiation token
  */
  router.post('/reset/:token',urlencodedparser,[check('password').not().isEmpty().withMessage('password is required'),
                                            check('password').isLength({min:6}).withMessage('Please enter a password at least 6 character.'),
                                            check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,).withMessage('Passwordmust contain one uppercase letter one lower case letter and one special character  '),
                                            check('password1').not().equals('password').withMessage('Passwords do not match'),
  ], function(req, res) {
      let errors =validationResult(req);
      if (errors.errors.lenght>0){
        console.log('im here')
        res.render('reset',{
          errors:errors

        });
      }else{
        console.log(req.body)
        async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              console.log('Password reset token is invalid or has expired.')
              return res.redirect('./forgot');
          }

          bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(req.body.password,salt,(err,hash)=>
          {
            if (err){
              console.log(err)
            } ;
            console.log(user.password)
            user.password=hash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            console.log(user.password)
            console.log('created')
            user.save(function(err) {
                      req.logIn(user, function(err) {
                        console.log('done')
                        done(err, user);
                      });
                    });
          }))
        });
      },
      function(user, done) {
        console.log('mail')
        var smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
              user: 'bookrest.com@gmail.com',
              pass: 'ead@0139'
                  }
                                                        });
        var mailOptions = {
          to: user.email,
          from: 'koushiks666@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      console.log('im1')
       res.redirect('/users/login');
    });
  };
  });

/*
Api to populate genre model
*/
  router.get('/addgenre',(req,res)=>{
    var n=new Genre({
      Genre: 'Romance',
    });
    n.save()
    .then(x=>{
      console.log(x)
      return res.sendStatus(200)
    })
  })


module.exports = router;
