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
const router = express.Router();
const multer = require('multer')
var app=express()
//EJS
//
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()){
        return next();
        console.log('sdfgsd');
        }
  else{
    console.log('sd');
    return res.redirect('/users/login');

  }
}

app.use('/uploads',express.static(__dirname + '/uploads'))

app.set('view engine','ejs');
app.use('/static',express.static('./static'));


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

var staticMiddleware = express.static(__dirname + '/static');
app.get('/static/*/:k',isLoggedIn, function(req, res, next){
  console.log('kjhbvcx');
  console.log(req.params.k);
  console.log(req.query);
  console.log(req.user);

    // console.log('about to send restricted file '+ req.params.file);
    req.url = req.url.replace(/^\/static/, '')
if(req.query.k==123){
    staticMiddleware(req, res, next);
  }else{
    return res.render('404')
  }
});


app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});





 db=require('./config/keys').MongoURI;


//connect to mong
mongoose.connect(db,{   dbName: 'EAD', useNewUrlParser: true,
                        useUnifiedTopology: true,useFindAndModify:false
                      })
    .then(()=>console.log('connected to mongodb'))
    .catch(err=>console.log(err))


    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, __dirname+'/uploads/books/')
      },
      filename: function (req, file, cb) {
        console.log(req.user);
        cb(null, file.originalname + req.user.id+ '.'+file.fieldname )
      }
    })
    app.use(multer({ storage: storage }).any());


//Routes

 app.use('/users',require('./routes/user'));
  app.use('/test',require('./routes/testing'));
app.use('/my',require('./routes/requestrare'));
app.use('/shelf',require('./routes/shelf'));


app.get("*", function(req, res){
  res.render('404');
});

 app.listen(3000, function(){
   console.log("Connected to server")
 });
console.log('you are listening to port 3000');
