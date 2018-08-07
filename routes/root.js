const express = require('express')
const route = express.Router()
const path = require('path')

const itemCtrl = require('../controllers/itemCtrl')
const fileCtrl = require('../controllers/fileCtrl')

route.post('/search',async(req,res) => {
    res.render('list-files',{files: await fileCtrl.seatchFiles(req.body.q.trim())})
})
route.get('/autocomplete/:text',async(req,res) => {
    res.send(await fileCtrl.getListOfFiles(req.params.text));
})
route.use('/findres',express.static(path.join(__dirname,'../public/findres/')))
route.use('/search',express.static(path.join(__dirname,'../public/search/')))
route.use('/login',(req,res) => {
    if(req.user) res.redirect('/admin/upload')
    else res.render('login')
})
route.use('/',express.static(path.join(__dirname,'../public/home/')))

route.get('/items/:id',async(req,res) => {
    try {
        res.send(await itemCtrl.getItems(req.params.id))
    } catch(e) {res.send(e)}
})

route.get('/download/:id',async (req,res) => {
    return fileCtrl.downloadFile(req.params.id,res)
})

route.get('/files/:pid',async(req,res) => {
    let output = {
        parentID: req.params.pid,
        files: []
    }
    try {
        output = await fileCtrl.getFiles(req.params.pid)
    } catch(e){}
    finally {
        res.render('list-files',output)
    }
})

module.exports = route