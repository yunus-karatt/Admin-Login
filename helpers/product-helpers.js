const { resolve } = require('path')
const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
module.exports = {
  addProduct: (product, callback) => {
    db.get().collection("product").insertOne(product).then((data) => {

      callback(data.insertedId)
    })
  },
  getAllProducts: () => {
    return new Promise(async (res, rej) => {
      let products = await db.get().collection('product').find().toArray()
      res(products)
    })
  },
  deleteProduct: (prodId) => {
    return new Promise((res, rej) => {
      const productId = new objectId(prodId)
      db.get().collection('product').deleteOne({ _id: productId }).then((response) => {
        res(response)
      })

    })
  },
  getProduct: (id) => {
    return new Promise((res, rej) => {
      const productId = new objectId(id)
      db.get().collection('product').findOne({ _id: productId }).then((data) => {
        res(data)
      })
    })
  },
  update: (proid, prodetails) => {
    return new Promise((res, rej) => {
      const productId = new objectId(proid)
      db.get().collection('product').updateOne({ _id: productId },{
          $set:
          {
            Name: prodetails.Name,
            Description: prodetails.Description,
            Price: prodetails.Price,
            Category: prodetails.Category
          }
        }).then((response) => {
          res()
        })
    })
  }
} 