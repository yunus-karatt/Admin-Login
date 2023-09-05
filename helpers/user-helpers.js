const { resolve } = require('path')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const objectId = require('mongodb').ObjectId
module.exports = {
  doSignup: (userdata) => {
    return new Promise(async (res, rej) => {
      userdata.Password = await bcrypt.hash(userdata.Password, 10)
      db.get().collection('user').insertOne(userdata)
      res(userdata)
    })


  },
  doLogin: (userdata) => {
    let loginStatus = false;
    let response = {}

    return new Promise(async (res, rej) => {
      let user = await db.get().collection('user').findOne({ Email: userdata.Email })

      if (user) {
        bcrypt.compare(userdata.Password, user.Password).then((status) => {
          if (status) {

            response.user = user
            response.status = true
            res(response)
          } else {
            console.log('login failed')
            res({ status: false })
          }
        })
      } else {
        console.log('no user found')
        res({ status: false })
      }
    })
  },
  addToCart: (proId, userId) => {
    const usersId = new objectId(userId);
    const prodId = new objectId(proId);
    let proObj = {
      item: prodId,
      quantity: 1
    }
    return new Promise(async (res, rej) => {
      let userCart = await db.get().collection('cart').findOne({ user: usersId })
      if (userCart) {
        let prodExist = userCart.products.findIndex(product => product.item == proId)
        
        if (prodExist != -1) {
          db.get().collection('cart').updateOne(
            {user:usersId, 'products.item': prodId },
            { $inc: { 'products.$.quantity': 1 } }
          ).then(()=>{
            res()
          })
        } else {
          db.get().collection('cart').updateOne({ user: usersId }, { $push: { products: proObj } }).then(() => {
            res()
          })
        }
      } else {
        let cartObj = {
          user: usersId,
          products: [proObj]

        }

        db.get().collection('cart').insertOne(cartObj).then((response) => {
          res()
        })
      }
    })
  },
  getCartProducts: (userId) => {
    const usersId = new objectId(userId)
    return new Promise(async (res, rej) => {
      let cartItems = await db.get().collection('cart').aggregate([
        {
          $match: { user: usersId }
        },
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:'product',
            localField:'item',
            foreignField:'_id',
            as:'product'
          }
        },
        {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        }
      
      ]).toArray()
      
      res(cartItems)
    })
  },
  getCartCount: (userId) => {
    const usersId = new objectId(userId)
    let count = 0;
    return new Promise(async (res, rej) => {
      let cart = await db.get().collection('cart').findOne({ user: usersId })
      if (cart) {
        count = cart.products.length
      }
      res(count)
    })
  },
  changeProductQuantity:(details)=>{
    
    count = parseInt(details.count)
    const cartsId = new objectId(details.cart)
    const prodId = new objectId(details.product);
    return new Promise(async(res,rej)=>{
      db.get().collection('cart').updateOne(
        {_id:cartsId, 'products.item': prodId },
        { $inc: { 'products.$.quantity': count } }
      ).then(()=>{
        res()
      })
    })
  }
}