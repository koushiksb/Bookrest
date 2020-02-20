const LocalStrategy = require('passport-local').Strategy;
const mongoose =require('mongoose');
const bcrypt = require('bcryptjs')
const User=require('../models/User')


module.exports=function(passport){

  passport.use('local',
    new LocalStrategy(function(email,password,done){

      User.findOne({email:email})
      .then(user => {
        if(!user){

          return done(null,false,req.flash('error', 'Username does not exist'));
        }
        bcrypt.compare(password,user.password,function(err,isMatch){
          if(err) throw err;

          if(isMatch){
            return done(null,user)
          }else{

            return done(null,false,req.flash('error', 'Incorrect username or password'));
          }
        });
      }
      )
      .catch(err => console.log(err));

    })
  );




  passport.serializeUser(function(user, done) {

  done(null, user.id);
});

passport.deserializeUser(function(id, done) {

    User.findById(id, function(err, user) {

      done(err, user);

    });
});
};
