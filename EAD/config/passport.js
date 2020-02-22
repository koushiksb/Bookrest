const LocalStrategy = require('passport-local').Strategy;
const mongoose =require('mongoose');
const bcrypt = require('bcryptjs')
const User=require('../models/User')
const GoogleStrategy = require('passport-google-oauth20')


module.exports=function(passport){

  passport.use('local',
    new LocalStrategy(function(email,password,done){
      User.findOne({email:email})
      .then(user => {
        if(user==null){
          console.log('Username does not exist');
          return done(null,false);
        }
        if(user.method=='normal'){
        bcrypt.compare(password,user.password,function(err,isMatch){
          if(err) throw err;

          if(isMatch){
            return done(null,user)
          }else{
            console.log('incorrect');
            return done(null,false);
          }
        });
      }else{
        console.log('try with google');
        return done(null,false);
      }
      }
      )
      .catch(err => console.log(err));

    })
  );


passport.use(
  new GoogleStrategy({
    callbackURL:'/users/google/redirect',
    clientID:'629614788190-ibkd0nf7trn1318ui41e18sskc12g6b2.apps.googleusercontent.com',
    clientSecret:'XxwsdLoGyYMbwVYEnLLj0gZ8'

  },(accessToken,refreshToken,profile,email,done)=>{

    console.log(email.emails[0].value);
    User.findOne({email:email.emails[0].value}).then((user)=>{
      if(user==null){
        new User({
          email:email.emails[0].value,
          googleid:email.id,
          method:'google',
          isVerified:true
        }).save().then(x=>
        {
          console.log('new user created');
          done(null,x)
        })
      }else{
        if(user.method=='google'){
          done(null,user)
        }else{
          console.log('already account linked');
          done(null,false)
        }

      }
    })
  })
)


  passport.serializeUser(function(user, done) {

  done(null, user.id);
});

passport.deserializeUser(function(id, done) {

    User.findById(id, function(err, user) {

      done(null, user);

    });
});
};
