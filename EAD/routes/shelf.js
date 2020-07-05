const express=require('express');
const router = express.Router();
const User=require('../models/User');
const Shelf=require('../models/Shelf');
const Book=require('../models/Book');
const Payment = require('../models/Payment')
const Profile = require('../models/Profile')
const Openbid = require('../models/Openbid')
const multer = require('multer');
var stripe = require("stripe")("sk_test_HjrHIdQ8B5TgrtyYDRHETh9c00FoxUGVPv");
var Review = require("../models/Review")
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

router.get('/view',(req,res)=>{

  Shelf.find({user:req.user._id,$or:[{period:{$exists:true,$gte: new Date()}},{period:{$exists:false}}]}).populate('book','Title ImageURLM').then(x=>{
    // console.log('check1',x);
    Shelf.find({user:req.user._id}).then(async (y)=>{
      // console.log('check2',y);

      await   y.forEach((item,index)=>{
          if(item.owner === '1'){
            Payment.find({purchaser:item.user,book:item.book}).then((z)=>{
              // console.log('z1',z);
              if(z.length > 0){
                // console.log('amount',z[0]['amount']);
                y[index].amount = z[0]['amount'];
                // console.log('huhujnuhy',y);
              }


            });
          }
        });
        console.log(x)
return res.render('shelf1',{book:x,layout:'navbar2',owner:y});
    });
  })

});

router.get('/addbook',(req,res)=>{
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
    
    res.render('addbook',{'booksInfo':booksInfo});    
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

router.get('/viewbook/:title',(req,res)=>{
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
  Book.findOne({Title:req.params.title}).then(async (x)=>{
   Review.find({book:x._id}).populate({path:'user',model:'User',populate:{path:'profile',model:'Profile'}}).then(async (y)=>{
        await y.forEach(review => {
          review.rating = Number(review.rating)*10;
    });
    var otherUsers=[];
    var col1 = 0;
    var col2=0;
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
    console.log(otherUsers)
    res.render('viewbk',{image:x.ImageURLL,genre:x.Genre,rating:(x.Rating/2).toFixed(1),title:x.Title,author:x.Author,reviews:y,col1:col1,col2:col2,otherUsers:otherUsers,layout:'navbar2.ejs'});

    })
  });
});

router.get('/deletebook/:title',(req,res)=>{
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

router.post('/uploadSoftCopy',multer(bookUploadConf).single('bookSoftCopy'),(req,res)=>{
  Shelf.findOneAndUpdate({user:req.user._id,book:req.body.bookid},{softcopy:[req.file.path]}).then(book=>{
    res.redirect('/shelf/view');
  });
})
router.get('/readbook/:bookid',(req,res)=>{
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
