const express = require('express')
const route = express.Router()

const passport = require('../server/passport')

const itemCtrl = require('../controllers/itemCtrl')
const fileCtrl = require('../controllers/fileCtrl')
const userCtrl = require('../controllers/userCtrl')

const config = require('../config')

route.post('/login',passport.authenticate('local',{
    successRedirect: '/admin/upload',
    failWithError: true
}),(err,req,res,next) => res.render('login',err))

const checkDefaultAdmin = (req,res,next) => {
    let email = req.user.email
    let defaultAdmins = config.DEFAULT_ADMINS || process.env.DEFAULT_ADMINS
    // defaultAdmins = JSON.parse(defaultAdmins)
    for(admin of defaultAdmins){
        if(admin.email == email)
            return next()
    }
    res.status(403).send('Unauthorized')
}

route.use('/',(req,res,next) => {
    if(req.user) return next()
    return res.redirect('/login')
})

route.post('/users',checkDefaultAdmin,async(req,res) => {
    try {
        res.send(await userCtrl.createNewUser(req.body))
    }catch(e) {res.send(e)}
})

route.delete('/users',checkDefaultAdmin,async (req,res) => {
    try{
        if(req.body.email == req.user.email) throw new Error('You cannot remove yourself!')
        res.send(await userCtrl.deleteUser(req.body.email))
    } catch (e) {res.status(400).send({error: e.message})}
})

route.patch('/users',async (req,res,next) => {
    try {
        await userCtrl.changePass(req.user.email,req.body)
        res.send()
    }catch(e){
        res.status(400).send({error: e.message})
    }
    
})

route.use('/logout',(req,res) => {
    req.logout()
    res.redirect('/login')
})
route.get('/upload',(req,res) => res.render('admin-upload'))
route.get('/modify/add',(req,res) => res.render('admin-modify-add'))
route.get('/modify/addAlias',(req,res) => res.render('admin-add-alias'))
route.get('/modify/changeAlias',async(req,res) => {
    res.render('admin-modify-alias',{items: await itemCtrl.getAllAliases()})
})
route.get('/modify/existing',(req,res) => res.render('admin-modify-existing'))
route.get('/manage',checkDefaultAdmin,async(req,res) => {
    const users = await userCtrl.getAllUsers()
    res.render('admin-manage',{users})
})
route.use('/me',async (req,res) => {
    res.render('admin-account',await userCtrl.getUserData(req.user.email))
})

route.post('/upload',fileCtrl.upload.single('file'), async (req,res) => {
    await itemCtrl.addChild(req.body.parentID,req.file.id)
    let filename = req.file.filename
    if(req.body.filename.length > 0)
        filename = await fileCtrl.renameFile(req.file.id,req.body.filename)
    res.send(filename)
})

route.patch('/files',async(req,res) => {
    let filename = await fileCtrl.renameFile(req.body.id,req.body.filename)
    res.send(filename)
})

route.post('/items',async(req,res) => {
    try {
        let new_item = await itemCtrl.addItems(req.body,req.body.parentID)
        res.send({label: new_item.label,name: new_item.name})
    } catch(e) {res.send(e)}
})

route.delete('/items',async(req,res) => {
    try {
        res.send(await itemCtrl.deleteItem(req.body))
    } catch(e) {res.send(e)}
})
route.get('/files/:pid', async (req,res) => {
    let output = {
        parentID: req.params.pid,
        files: []
    }
    try {
        output = await fileCtrl.getFiles(req.params.pid)
    } catch(e){} 
    finally {
        res.render('admin-list-files',output)
    }
})
route.delete('/files', async (req,res) => {
    try {
        let filename = await fileCtrl.deleteFiles(req.body)
        res.send(filename)
    } catch (e) {
        res.status(404).json({error: e})
    }
})

route.post('/alias',async (req,res) => {
    try {
        await itemCtrl.addAlias(req.body)
        res.send()
    }catch(e){
        res.status(400).json({error: e})
    }
})

route.delete('/alias',async (req,res) => {
    try {
        await itemCtrl.deleteAlias(req.body.id)
        res.send()
    }catch(e){
        res.status(400).json({error: e})
    }
})

route.use('/',(req,res) => res.redirect('/admin/upload'))
route.use((req,res) => res.redirect('/admin'))

module.exports = route