const express=require('express');
const router = express.Router();
const User=require('../models/User');
const Shelf=require('../models/Shelf');
const Book=require('../models/Book');
const Payment = require('../models/Payment')
const Profile = require('../models/Profile')
const Openbid = require('../models/Openbid')
const multer = require('multer');
// var stripe = require("stripe")("sk_test_HjrHIdQ8B5TgrtyYDRHETh9c00FoxUGVPv");
var stripe = require("stripe")("sk_test_51Gtt6XLG3iR3WbW8vxYgFfkTZlVP25gJQOHlwCqXVMYqQrx2dFNBQFCLfWVYBDff5vQNWn7kMLUz8yltheNLK80G00ClkQSdw3");
var Classify = require("../models/Classify")
var Review = require("../models/Review")
const isLoggedIn = require('../utils/isLoggedIn');
// const s3 = require('../config/aws');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3-v2');
const AWS = require('aws-sdk');
var s3 = new aws.S3(
// {
//   accessKeyId: '',
//   secretAccessKey: ''
//
// }
);
// store and validation
const multerconf = {
  storage:multer.diskStorage({
    destination:function(req,file,next){
      // const ext = file.mimetype.split('/')[0];
      // if(ext === 'image'){
        next(null,'./static/coverimages');
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
const bookUploadConf = {
  storage:multer.diskStorage({
    destination:function(req,file,next){
      // const ext = file.mimetype.split('/')[0];
      // if(ext === 'image'){
        next(null,'./static/books');
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
const awsbookupload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'bookrest',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});

router.get('/view',isLoggedIn.isLoggedIn,(req,res)=>{

  Shelf.find({user:req.user._id,$or:[{period:{$exists:true,$gte: new Date()}},{period:{$exists:false}}]}).populate('book','Title ImageURLM').then(async(x)=>{
    // console.log('check1',x);
    Shelf.find({user:req.user._id}).lean().then(async(y)=>{
      // console.log('check2',y);

      for(i=0;i<y.length;i++) {
        if(y[i].owner === '1') {
          await Payment.find({purchaser:y[i].user,book:y[i].book._id}).then((z)=>{
            console.log('z1',z);
            if(z.length > 0) {
              y[i].amount = z[0].amount;
            }
          });
        }
      }
      return res.render('shelf1',{book:x,layout:'navbar2',owner:y});
    });
  })

});

router.get('/addbook',isLoggedIn.isLoggedIn,(req,res)=>{
  Book.find({}).then((books)=>{
    var booksInfo = [];
    for(i=0;i<books.length;i++) {
      var inf = [];
      inf.push(books[i].Title);
      inf.push(books[i].Publisher);
      inf.push(books[i].Author);
      inf.push(books[i].YearOfPublication);
      inf.push(books[i].ImageURLL)
      booksInfo.push(inf);
    }
    console.log('booksInfo',booksInfo.length);

    res.render('addbook',{'booksInfo':booksInfo,layout:'navbar2'});
  });

});

// router.post('/check',multer(multerconf).single('pdf'),(req,res)=>{
//   console.log(req.file);
//   res.send('this is post the pdf upload');
// });

function path(req){
  if(req.file){
    return '../static/coverimages/'+req.file.filename;
  }
  else{
    return '../static/pics/image_placeholder.jpg';
  }
}

router.post('/addbook',multer(multerconf).single('photo'),(req,res)=>{

  console.log(req.file);

  Book.findOne({Title:req.body.bookname}).then(re=>{
    if(re === null){
      console.log('in NUll');
      var n = new Book({
        Publisher:req.body.publisher,
        Title:req.body.bookname,
        Author:req.body.author,
        YearOfPublication:req.body.year,
        ImageURLS: path(req)
      });
      n.save().then(x=>{
        console.log('saved to books collection successfully');
        // console.log(x);
        var m = new Shelf({
          user:req.user._id,
          book:x._id
        });
        m.save().then(y=>{
          console.log('saved to Shelves collection successfully');
          res.redirect('/shelf/view');
          // console.log(y);
        })
      });
    }
    else{
      Shelf.findOne({user:req.user._id,book:re.id}).then(sh=>{
        if(sh === null){
          var m = new Shelf({
            user:req.user._id,
            book:re._id
          });
          m.save().then(y=>{
            console.log('saved to Shelves collection successfully');
            res.redirect('/shelf/view');
            // console.log(y);
          })
        }
        else{
          // alredy added this book
          res.redirect('/shelf/view');
        }
      });


    }
  });

});

router.get('/viewbook/:title',isLoggedIn.isLoggedIn,(req,res)=>{
  var inbidding=0
  Book.findOne({Title:req.params.title}).then(async (x)=>{
    var owner = '0';
    var softCopy = false;
    var readRequestAmount=5;
    var hasHardCopy=false;

  await Openbid.findOne({bookid:x.id,userid:req.user.id}).then(a=>{
      if(a!=null){
        console.log('a',a)
        inbidding =1
      }
    })
    await Shelf.findOne({user:req.user._id,book:x.id}).then(y=>{
      // console.log(y);
      console.log(y);
      if(y.hasHardCopy){
        hasHardCopy = y.hasHardCopy;
      }
      if(y.owner){
        owner  = y.owner

      }
      if(y.readRequestAmount){
        readRequestAmount = y.readRequestAmount;

      }
      if(y.softcopy){
        softCopy = (y.softcopy.length>0 );

      }
      console.log(y)
    });
    console.log('in bidding',inbidding)
    res.render('viewbook',{image:x.ImageURLL,title:x.Title,otherUserShelf:false,author:x.Author,inbidding:inbidding,id:x._id,owner:owner,softCopy:softCopy,readRequestAmount:readRequestAmount,hasHardCopy:hasHardCopy,layout:'navbar2.ejs'});
  });
});
router.get('/otherUserShelfviewbook/:title/:userid',(req,res)=>{
  var inbidding=0;
  req.session.otherUserShelfUserId = req.params.userid;
  console.log(req.params);
  Book.findOne({Title:req.params.title}).then(async (x)=>{
    console.log('selected book')
    console.log(x);
  Openbid.findOne({bookid:x.id,userid:req.params.userid}).then(a=>{
      if(a!=null){
        inbidding =1
      }
    })
    var owner = '0';
    var softcopy = false;
    var readRequestAmount = false;
    await Shelf.findOne({user:req.params.userid,book:x._id,owner:{$exists:false},softcopy:{$exists:true}}).then(y=>{
      console.log(y);
      softCopy = true;
      if(y.readRequestAmount){
        readRequestAmount = y.readRequestAmount;
        console.log(readRequestAmount,y.readRequestAmount)
      }
    });
console.log(owner);
    res.render('viewbook',{image:x.ImageURLL,readRequestAmount:readRequestAmount,title:x.Title,otherUserShelf:true,author:x.Author,inbidding:inbidding,id:x._id,owner:owner,softCopy:softCopy,layout:'navbar2.ejs'});
  });
});

router.get('/otherUserShelf/:userid',(req,res)=>{
  Shelf.find({user:req.params.userid,softcopy:{$exists:true},owner:{$exists:false}}).select('book -_id').populate('book','Title ImageURLM').then(x=>{
    // console.log(x);
    var owner = '0';
    readRequestAmount = 5;
    Shelf.find({user:req.params.userid}).then(y=>{
      // console.log(y);
      console.log(y);
      if(y.owner){
        owner  = y.owner

      }
      if(y.readRequestAmount){
        readRequestAmount = y.readRequestAmount;

      }

      return res.render('otherUserShelf',{book:x,layout:'navbar2',owner:y,readRequestAmount:readRequestAmount,userid:req.params.userid});
    });
  })

});




router.get('/viewbk/:title',async (req,res)=>{
  var navbar;
  console.log('fine')
  console.log(req.isAuthenticated())
  if(req.isAuthenticated()){
    navbar = 'navbar2.ejs'
    console.log('wrong')
  }else{
    navbar = 'navbar.ejs'
    console.log('yay')
  }
  Book.findOne({Title:req.params.title}).then(async (x)=>{
    var given = {} ;
    Review.find({book:x._id,user:req.user.id}).populate({path:'user',model:'User',populate:{path:'profile',model:'Profile'}}).then(async (l)=>{
      given = l;
      console.log(given.length)
      if(given.length >0){
      given[0].rating = Number(given[0].rating)*10
    }
      });
    var suggest = false;
    Classify.find({book:x._id,user:req.user.id}).then(c=>{
      if(c.length===0){
        suggest = true;
      }
    });
   Review.find({book:x._id}).populate({path:'user',model:'User',populate:{path:'profile',model:'Profile'}}).then(async (y)=>{
        await y.forEach(review => {
          review.rating = Number(review.rating)*10;
        });
    var otherUsers=[];
    var col1 = 0;
    var col2=0;
    if(req.user){
      await  Shelf.find({book:x._id,softcopy:{$exists:true},owner:{$exists:false},user:{$ne:req.user._id}}).populate({path:'user',model:'User',populate:{path:'profile',model:'Profile'}}).then(async (shelfs)=>{
          await shelfs.forEach((item, i) => {
            if(item.softcopy){
              otherUsers.push({_id:item.user._id,name:item.user.profile.fname+' '+item.user.profile.lname})

            }
          });
          if(otherUsers.length%2===0){
            console.log('here')
              col1=otherUsers.length/2;
              col2=otherUsers.length;
          }else{
            console.log('not here')
            col1=(otherUsers.length+1)/2;
            col2=otherUsers.length;

          }
          console.log(col1,col2)
        })
    }else{
      await  Shelf.find({book:x._id,softcopy:{$exists:true},owner:{$exists:false}}).populate({path:'user',model:'User',populate:{path:'profile',model:'Profile'}}).then(async (shelfs)=>{
          await shelfs.forEach((item, i) => {
            if(item.softcopy){
              otherUsers.push({_id:item.user._id,name:item.user.profile.fname+' '+item.user.profile.lname})

            }
          });
          if(otherUsers.length%2===0){
            console.log('here')
              col1=otherUsers.length/2;
              col2=otherUsers.length;
          }else{
            console.log('not here')
            col1=(otherUsers.length+1)/2;
            col2=otherUsers.length;

          }
          console.log(col1,col2)
        })

    }

    console.log(otherUsers)
    res.render('viewbk',{suggest:suggest,given: given,image:x.ImageURLL,genre:x.Genre,rating:(x.Rating/2).toFixed(1),title:x.Title,author:x.Author,reviews:y,col1:col1,col2:col2,otherUsers:otherUsers,layout:navbar});

    })
    })
  });


router.get('/classify/:title/:interest',(req,res)=>{
  var sug = req.params.interest;
  Book.find({Title:req.params.title}).then(x=>{
    new Classify({
      book:x[0]._id,
      user:req.user.id,
      know:false
    }).save()
  return res.redirect('/shelf/viewbk/'+req.params.title)
  });
})

router.post('/classify/:title/:interest',(req,res)=>{
  var sug = req.params.interest;
  Book.find({Title:req.params.title}).then(x=>{
    if(sug){
      var cla = req.body.Class;
     new Classify({
      book:x[0]._id,
      user:req.user.id,
      know:true,
      opinion:cla
    }).save()
    }
  return res.redirect('/shelf/viewbk/'+req.params.title)
  });
})

router.post('/addreview/:title',(req,res)=>{
  var rev = req.body.review;
  var rate = req.body.rate;
  Book.find({Title:req.params.title}).then(x=>{
    Review.find({book:x[0]._id,user:req.user.id}).then(y=>{
      // console.log(y.length)
      if(y.length>0){
        y[0].rating=rate;
        y[0].review=rev;
        y[0].save()
        // console.log(y)
      }
      else{
        new Review({
        book:x[0]._id,
        user:req.user.id,
        rating:rate,
        review:rev,
      }).save()
      var te = (x[0].Rating*x[0].Treviews)+rate
      x[0].Treviews = x[0].Treviews+1
      x[0].Rating = te/x[0].Treviews
      x[0].save()
      }
    })
  })
  return res.redirect('/shelf/viewbk/'+req.params.title)
})


router.get('/deletereview/:title',(req,res)=>{
  var rev = req.params.title;
  Book.find({Title:req.params.title}).then(x=>{
    Review.findOneAndRemove({book:x[0]._id,user:req.user.id}).then(y=>{
      var te = (x[0].Rating*x[0].Treviews)-y.rating
      x[0].Treviews = x[0].Treviews-1
      x[0].Rating = te/x[0].Treviews
      x[0].save()
      return res.redirect('/shelf/viewbk/'+req.params.title)
    })
  })
})


router.get('/deletebook/:title',isLoggedIn.isLoggedIn,(req,res)=>{
  Book.findOne({Title:req.params.title}).then(x=>{
    Shelf.findOneAndRemove({user:req.user._id,book:x._id}).then(y=>{
      res.redirect('/shelf/view');
    });
  })
});


router.post('/charge',(req,res)=>{
  var token = req.body.stripeToken;
  var chargeAmount = req.body.chargeAmount;
  var bookid = req.body.id;
  var charge = stripe.charges.create({
    amount : chargeAmount,
    currency : "inr",
    source : token,
  }, function(err,charge){
    if(err){
      console.log("Your card was declined");
    }
}).then((hh)=>{
  // add bookid to the users subscription list
  // console.log(bookid);
  Shelf.findOneAndUpdate({user:req.user._id,book:bookid},{paid:1}).then(z=>{
    Payment.findOneAndUpdate({purchaser:req.user._id,book:bookid},{status:true}).then(d=>{
      User.findOneAndUpdate({_id:d.owner},{$inc : { walletBalance: chargeAmount} }).then(u=>{
        res.redirect('/shelf/view');
      });
    });
  });
});
});

router.post('/uploadSoftCopy',[isLoggedIn.isLoggedIn,multer(bookUploadConf).single('bookSoftCopy')],(req,res)=>{
  console.log(req.file)
  Shelf.findOneAndUpdate({user:req.user._id,book:req.body.bookid},{softcopy:req.file.location}).then(book=>{
    res.redirect('/shelf/view');
  });
})
router.get('/readbook/:bookid',isLoggedIn.isLoggedIn,(req,res)=>{
  Shelf.findOne({user:req.user._id,book:req.params.bookid}).then((book)=>{
    console.log(book.softcopy)
    res.render('pdfviewer',{pdfPath:book.softcopy})
  });


});
router.post('/setpayableamount',(req,res)=>{
  Shelf.findOne({user:req.user._id,book:req.body.bookid}).then(book=>{
      book.readRequestAmount = req.body.amount;
      book.save().then(call=>{
        console.log('saved');
        res.sendStatus(200)
      })

  })

})
module.exports = router;
