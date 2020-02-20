const express=require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const bodyparser=require('body-parser');
const bcrypt=require('bcryptjs');
const passport=require('passport');
const User=require('../models/User')

var urlencodedparser=bodyparser.urlencoded({extended:true});
bodyParser = require('body-parser').json();


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/users/login');
}
function IsAuth(req,res,next){
  if(!req.isAuthenticated())
    return next()
  res.redirect('/users/dashboard')
}

router.get('/login',(req,res)=>res.render('login'));
router.get('/signup',(req,res)=>res.render('signup',{errors:[]}));


router.post('/signup',urlencodedparser,[
                                          check('password').not().isEmpty().withMessage('password is required'),
                                          check('password').isLength({min:6}).withMessage('Please enter a password at least 6 character.'),
                                          check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,).withMessage('Passwordmust contain one uppercase letter one lower case letter and one special character  '),
                                          check('password1').not().equals('password').withMessage('Passwords do not match'),
                                          check("email").not().isEmpty().withMessage('Email is required'),
                                          check('email').isEmail().withMessage('Enter valid email'),
],(req,res)=>{
  console.log(req.body);

  const password=req.body.password;
  const password1=req.body.password1;
  const email=req.body.email;

  let errors =validationResult(req);


  User.findOne({email:email}).then(function(user){
    error = {
      param:'email',
      msg:'Email already in use',
      value:email

    }
    errors.errors.push(error)

  });


  if (errors.errors.length>0){
    return res.render('signup.ejs',{
      errors:errors

    });
  }else{

    let newUser = new User({

      email:email,
      password:password,

    });
bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>
{
  if (err){
    console.log(err)
  } ;
  newUser.password=hash;
  console.log('created')
  newUser.save()
  .then(function(user){
    return res.redirect('./login')})
  .catch(err=>console.log(err))

}))

  return res.redirect('/users/login');
  }

});

router.post('/login',IsAuth,urlencodedparser,(req,res,next)=>{
  console.log(req.body)
passport.authenticate('local',{
  successRedirect:'/users/dashboard',
  failureRedirect:'/users/login',
  failureFlash:true
})(req,res,next);

});



router.get('/logout',(req,res)=>{
  req.logout()
  res.redirect('/')
})

router.get('/dashboard',(req,res)=>{

  res.render('dashboard')
})


module.exports = router;
