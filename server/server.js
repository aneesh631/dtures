const express = require('express')
const path = require('path')
const session = require('express-session')
const passport = require('./passport')

const admin = require('./../routes/adminRoute')
const root = require('./../routes/root')

const config = require('../config')
const PORT = process.env.PORT || 3000 ;

const app = express()

app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: process.env.PASSPORT_SECRET || config.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.set('views',path.join(__dirname,'../views'))
app.set('view engine','hbs')

app.use('/scripts',express.static(path.join(__dirname,'../scripts')))
app.use('/libs',express.static(path.join(__dirname,'../libs')))

app.use('/admin',admin)
app.use('/',root)
app.use((req,res) => res.redirect('/'))

app.listen(PORT,console.log(`Server started on port ${PORT}`))