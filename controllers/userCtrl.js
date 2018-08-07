const {User} = require('../server/models/user')
const util = require('util')
const bcrypt = require('bcryptjs')
const comparePass = util.promisify(bcrypt.compare)
const genSalt = util.promisify(bcrypt.genSalt)
const hashPass = util.promisify(bcrypt.hash)

const config = require('../config')

const createNewUser = async (body) => {
    let user  = {
        email: body.email,
        password: body.password || config.DEFAULT_PASSWORD || process.env.DEFAULT_PASSWORD,
        name: body.name
    }
    user = await new User(user).save()
    return {name:user.name,email:user.email}
}

const getUserData = async (email) => {
    let user = await User.findOne({email})
    let data = {
        email: user.email,
        name: user.name
    }
    return data
}

const getAllUsers = async () => {
    let output = []
    let users = await User.find({})
    for(user of users)
        output.push({name:user.name,email:user.email})
    return output
}

const deleteUser = async (email) => {
    let user = await User.findOneAndRemove({email})
    return  {name:user.name,email:user.email}
}

const changePass = async (email,body) => {
    let user = await User.findOne({email})
    let result = await comparePass(body.oldpass,user.password)
    if(!result) throw new Error('Wrong password!')
    if(body.newpass.length <6) throw new Error('Password should contain atleast 6 characters!')
    let salt = await genSalt(10)
    let hash = await hashPass(body.newpass,salt)
    await User.findOneAndUpdate({email},{password: hash})
}
module.exports = {
    createNewUser,
    getUserData,
    getAllUsers,
    deleteUser,
    changePass
}