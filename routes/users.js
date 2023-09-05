var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')



const verifyLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function (req, res, next) {
  let user = req.session.user
  let cartCount=null
  if(req.session.user){
  cartCount =await userHelpers.getCartCount(req.session.user._id)
}
  productHelper.getAllProducts().then((data) => {
    res.render('user/view-products', { data, user, cartCount });
  })

});
router.get('/login' ,(req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { loginErr: req.session.loginErr })
    req.session.loginErr = false
  }

})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user=response
    req.session.userloggedIn=true
    
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {

  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userloggedIn = true
      
      res.redirect('/')
    } else {
      req.session.loginErr = true
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user=null
  req.session.userloggedIn=false
  res.redirect('/')
})
router.get('/cart', verifyLogin,async (req, res) => {
  let products =await userHelpers.getCartProducts(req.session.user._id) 
  
    res.render('user/cart',{products,user:req.session.user})
  
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log('api call')
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(()=>{
   
  })
})
module.exports = router;
