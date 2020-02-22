const express=require('express');
const router = express.Router();

router.get('/nav',function(req,res){
  return res.render('navbar.ejs')
})

module.exports  = router
