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
const CronJob = require('cron').CronJob;

const multer = require('multer');
var partials      = require('express-partials');
const Bidding = require('./models/Bidding.js');
const Openbid = require('./models/Openbid');
const Shelf = require('./models/Shelf')
const isLoggedIn = require('./utils/isLoggedIn')
var app=express()
//EJS
//


app.use('/uploads',express.static(__dirname + '/uploads'))

app.set('view engine','ejs');
// app.use('/static',express.static('./static'));


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
app.get('/static/*/:k', function(req, res, next){
  console.log('kjhbvcx');
  console.log(req.params.k);
  console.log(req.query);
  console.log(req.user);

    // console.log('about to send restricted file '+ req.params.file);
    req.url = req.url.replace(/^\/static/, '')
    staticMiddleware(req, res, next);
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


    // var storage = multer.diskStorage({
    //   destination: function (req, file, cb) {
    //     cb(null, __dirname+'/uploads/books/')
    //   },
    //   filename: function (req, file, cb) {
    //     console.log(req.user);
    //     cb(null, file.originalname + req.user.id+ '.'+file.fieldname )
    //   }
    // })
    // app.use(multer({ storage: storage }).any());
    //

//Routes
app.get('/',(req,res)=>{
  console.log(req.isAuthenticated);
  res.redirect('/users/dashboard');
})
 app.use('/users',require('./routes/user'));
  app.use('/test',require('./routes/testing'));
app.use('/my',require('./routes/requestrare'));
app.use('/shelf',require('./routes/shelf'));

app.use('/book',require('./routes/bidding'));

app.use('/exchange',require('./routes/exchange'));



app.get("*", function(req, res){
  res.render('404');
});

 var server = app.listen(3000, function(){
   console.log("Connected to server")
 });

 const io = require('socket.io')(server)
 io.on('connect',(socket)=>{
   console.log('new user connected');
   socket.username = 'Anonymous'
   socket.on('join', function(data){
     console.log(data);
     if(socket.room)
         socket.leave(socket.room);

     socket.room = data.room;
     var room = data.room
     socket.join(data.room);
     console.log(socket.room);
 });

    socket.on('change_username',(data)=>{
     socket.username = data.username
   })
   socket.on('sold',(data)=>{
     console.log(data)
     console.log('yoo')

Openbid.findOne({_id:data.bidid,status:1,soldto:{$exists:false}}).then(async (bid)=>{
  var soldto = false;
  var soldfor = false;
  var amount = false;
  console.log(bid)
  if(bid!=null){
await Bidding.find({bidid:data.bidid}).sort({amount : -1}).limit(1).then((allbids)=>{
    if(allbids.length>0){
      soldfor = allbids[0].amount;
      soldto = allbids[0].userid;

    }
  })
  if(soldto && soldfor){
    bid.soldto=soldto;
    bid.soldfor=soldfor;
    bid.status = 0;
    bid.save().then(suc=>{
      console.log('updated successfully');

    })
  }
}else{
  console.log('alredy updated')
}

})
 // User.findOne({})
 // Openbid.findOne({_id:data.bidid}).then((bid)=>{
 //
 // })


  })


   socket.on('new_message',(data)=>{
     var bid = new Bidding({
       room:data.room,
       username:data.username,
       userid:data.userid,
       amount:data.message,
       bidid:data.bidid

     })

     bid.save()
     .then(x=>{
       io.sockets.in(data.room).emit('new_message',{message:data.message,username:data.username})

     })
     .catch(err=>{
       console.log(err);
     })
   })
   socket.on('typing',(data)=>{
      socket.broadcast.in(data.room).emit('typing',{username:socket.username})
   })
 })

 const staleAuctionRemoveJob = new CronJob('0 */10 * * * *', function() {
 	const d = new Date();
  d.setDate(new Date().getDate()-1);
  Openbid.deleteMany({status:1,date:{$lt:d}}).then(x=>{
    console.log('done')
  })
 	console.log('Midnight:', d);
},null,true,'Asia/Kolkata');
 console.log('After job instantiation');

 const expiredBooksRemoveJob = new CronJob('0 */10 * * * *', function() {
   Shelf.deleteMany({period:{$exists:true,$lt: new Date()}}).then(async(x)=>{
     console.log('removed expired books')
  })

},null,true,'Asia/Kolkata');
 console.log('After job instantiation');

 staleAuctionRemoveJob.start();
 expiredBooksRemoveJob.start();
console.log('you are listening to port 3000');
