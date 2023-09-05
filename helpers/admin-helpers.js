const db = require('../config/connection');
const { resolve } = require('path')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const objectId = require('mongodb').ObjectId
module.exports = {
  doLogin: (data) => {
    let loginStatus = false;
    let responsea = {}

    return new Promise(async (res, rej) => {
      let admin = await db.get().collection('admins').findOne({ username: data.username })
      if (admin) {
        bcrypt.compare(data.password, admin.password).then((status) => {
          if (status) {
            responsea.admin = admin
            responsea.status = true
            res(responsea)
          } else {
            console.log('no user found')
            res({ status: false })
          }
        })
      } else {
        console.log('no user found')
        res({ status: false })
      }
    })


  },
  getAllUsers: () => {
    return new Promise(async (res, rej) => {
      let userlist = await db.get().collection('user').find({}).toArray()

      res(userlist)
    })
  },
  deleteUser: (id) => {
    id = new objectId(id)
    return new Promise((res, rej) => {
      db.get().collection('user').deleteOne({ _id: id }).then(() => {
        res()
      })
    })
  },
  searchUser: (search) => {
    return new Promise(async (res, rej) => {
      let find = await db.get().collection('user').find({ $or: [{ Email: { $regex: search, $options: 'i' } }, { Name: { $regex: search, $options: 'i' } }] }).toArray()
      res(find)

    })

  },
  addUser: ({ username, useremail, userpassword }) => {
    console.log(username)
    return new Promise(async (res, rej) => {
      userpassword = await bcrypt.hash(userpassword, 10)
      db.get().collection('user').insertOne({
        Name: username,
        Email: useremail,
        password: userpassword
      }).then(() => {
        res()
      })
    })
  },
  getUser: (id) => {
    id = new objectId(id)
    return new Promise(async (res, rej) => {
      let user = await db.get().collection('user').findOne({ _id: id })
      res(user)
    })
  },
  updateUser: (id, user) => {
    id = new objectId(id)
    console.log(user)
    const { updatename, updateemail } = user
    return new Promise(async (res, rej) => {
      db.get().collection('user').updateOne({ _id: id }, { $set: { Name: updatename, Email: updateemail} }).then(() => {
        res()
      })
    })
  }
}