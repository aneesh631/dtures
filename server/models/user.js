const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    name: {
        type: String,
        required: true
    }
})

UserSchema.pre('save',function (next) {
    let user = this
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt) => {
            bcrypt.hash(user.password,salt,(err,hash) => {
                user.password = hash
                next()
            })
        })
    }
    else{
        next()
    }
})

const User = mongoose.model('user',UserSchema)

module.exports = {User}