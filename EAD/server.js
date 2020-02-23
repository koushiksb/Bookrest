const express = require('express');
const mongoose = require('mongoose');
const bodyparser=require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
var passport=require('passport');
const cookieSession = require('cookie-session')
const expressLayouts = require('express-ejs-layouts')
const cors = require('cors');


var app=express()
//EJS


app.set('view engine','ejs');
app.use(express.static('./static'));


app.use(expressLayouts)
//db congif
// app.use(bodyparser.json())
// app.use(cors())

// app.use(session({
//   secret: 'secret',
//   resave: true,
//   saveUninitialized: true,
//
// }));
app.use(cookieSession({
  maxAge:24*60*60*1000,
  keys:['jhbjbjnjjhdsjdkaldoiwurfhd']
}))

var urlencodedparser=bodyparser.urlencoded({extended:true});
app.use(urlencodedparser);

app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});





 db=require('./config/keys').MongoURI;


//connect to mong
mongoose.connect(db,{   dbName: 'EAD', useNewUrlParser: true,
                        useUnifiedTopology: true
                      })
    .then(()=>console.log('connected to mongodb'))
    .catch(err=>console.log(err))





//Routes

 app.use('/users',require('./routes/user'));
  app.use('/test',require('./routes/testing'));



app.get("*", function(req, res){
  res.render('404');
});

 app.listen(3000, function(){
   console.log("Connected to server")
 });
console.log('you are listening to port 3000');
