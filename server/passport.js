const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {User} = require('./models/user')
const bcrypt = require('bcryptjs')

passport.serializeUser((user,done) => {
    done(null,user.email)
})

passport.deserializeUser((email,done) => {
    User.findOne({email: email})
        .then(user => {
            if(!user) return done(new Error('No such user'))
            return done(null,user)
        })
        .catch(err => done(err))
})

passport.use(new LocalStrategy({
    usernameField: 'email'
  },(username,password,done) => {
    User.findOne({email: username})
    .then(user => {
        if(!user) return done(null,false,{message: "No such user"})
        bcrypt.compare(password,user.password,(err,result) => {
            if(err || !result) return done(null,false,{message: "Wrong password"})
            return done(null,user)
        })
    })
}))

module.exports = passport
