var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')
const adminHelper = require('../helpers/admin-helpers')
const fs = require('fs')
// Admin Login &Logout
function islogin(req, res, next) {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.render('admin/adminlogin', { admin: true })
  }
}

router.get('/adminlogin', (req, res) => {
  let session = req.session
  console.log(session)
  if (req.session.adminloggedIn) {
    res.redirect('/admin/')
  } else {
    res.render('admin/adminlogin', { loginErr: req.session.loginErr, admin: true, session })
  }

})
router.post('/adminlogin', (req, res) => {
  adminHelper.doLogin(req.body).then((data) => {
    if (data.status) {
      req.session.admin = data.admin
      req.session.adminloggedIn = true
      res.redirect('/admin/')
    } else {
      req.session.loginErr = true
      res.redirect('/admin/adminlogin')
    }
  })

})

router.get('/adminlogout', (req, res) => {
  req.session.admin = null
  req.session.adminloggedIn = false
  res.redirect('/admin/adminlogin')
})
// user update routes
router.get('/userslist', islogin, (req, res) => {
  adminHelper.getAllUsers()
    .then((userlist) => {
      res.render('admin/users-list', { admin: true, userlist })
    })

})
router.get('/deleteuser/:id', (req, res) => {
  adminHelper.deleteUser(req.params.id).then(()=>{
    res.redirect('/admin/userslist')
  })
})
router.get('/search/',(req,res)=>{
  const search = req.query.query
  adminHelper.searchUser(search)
  .then((userlist)=>{
    res.render('admin/users-list',{userlist})
  })
  
}),
router.get('/adduser',(req,res)=>{
  res.render('admin/adduser')
})
router.post('/adduser',(req,res)=>{
  adminHelper.addUser(req.body).then(()=>{
    res.redirect('/admin/userslist')
  })
})

router.get('/updateuser/:id',(req,res)=>{
  adminHelper.getUser(req.params.id).then((user)=>{
    res.render('admin/update',{user})
  }) 

})

router.post('/updateuser/:id',(req,res)=>{
  
  adminHelper.updateUser(req.params.id,req.body).then(()=>{
    res.redirect('/admin/userslist')
  })
})
/* GET product listing. */
router.get('/', islogin, function (req, res, next) {
  let session = req.session
  productHelper.getAllProducts().then((data) => {
    res.render('admin/view-products', { admin: true, data, session })
  })

});

router.get('/add-product', (req, res) => {

  res.render('admin/add-product', { admin: true })
})
router.post('/add-product', (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-product')
      } else {
        console.log(err)
      }
    })

  })

})
router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id
  const path = './public/product-images/' + prodId + '.jpg';
  fs.unlinkSync(path)
  productHelper.deleteProduct(prodId).then((response) => {
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelper.getProduct(req.params.id)

  res.render('admin/edit-product', { admin: true, product })
})
router.post('/edit-product/:id', (req, res) => {
  productHelper.update(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/')
      if (req.files.image) {
        let image = req.files.image
        image.mv('./public/product-images/' + req.params.id + '.jpg')
      }
    })
})
module.exports = router;
