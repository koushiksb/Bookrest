  /*

  User login module is based on passportjs
  all the login authentication logic is here

  Login credentials are validated
  if login is successfull, logged in users details are serialized and then
  deserialized and stored in req.

  */



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
      clientID:'295876350346-30lus3bd41ip8i62es6oahdi2n4lqc1t.apps.googleusercontent.com',
      clientSecret:'recHYgjIeypSTRrkcsG2axmr'

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
