const {mongoose} = require('./../server/db/mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const ObjectID = require('mongodb').ObjectID

const itemCtrl = require('./itemCtrl')
const config = require('../config')

let gfs
mongoose.connection.once('open', function () {
    gfs = Grid(this.db, mongoose.mongo)
    gfs.collection('uploads')
})
const storage = new GridFsStorage({
    url: config.MONGO_URI || process.env.MONGO_URI,
    file: (req,file) => {
        const filename = file.originalname
        const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
        }
        return fileInfo
    }
})
const upload = multer({ storage })
const gfsFindById = async (id) => {
    return new Promise((resolve,reject) => {
        gfs.files.findOne({'_id': ObjectID(id)},(err,file) => {
            if(!file || file.length ===0)
                reject({error: 'No file found.'})
            resolve(file)
        })
    })
}
const getChildrenId = itemCtrl.getChildrenId
const getFiles = async (pid) => {
    let output = {
        parentID: pid,
        files: []
    }
    let children = await getChildrenId(pid)
    for(child of children){
        let temp = {id: child}
        let file = await gfsFindById(child)
        temp.filename = file.filename
        temp.size = parseFloat(file.length/1024/1024).toFixed(2).toString()+' M'
        output.files.push(temp)
    }
    return output
}

const downloadFile = async (id,res) => {
    let file = await gfs.files.findOne({'_id': ObjectID(id)})
    if(!file || file.length ===0)
        res.status(404).json({error: 'No file found.'})
    res.writeHead(200, {
        'Content-Type': file.contentType,
        'Content-Length': file.length,
        'Content-Disposition': `attachment; filename="${file.filename}"`
    });
    return gfs.createReadStream(file.filename).pipe(res)
}

const removeFileById = async (id) => {
    let file = await gfsFindById(id)
    await gfs.remove({_id: id,root: 'uploads'})
    return file.filename
}

const renameFile = async (id,newname) => {
    let originalFile = await gfs.files.findOne({'_id': ObjectID(id)})
    let originalExtname = originalFile.filename.split('.').pop()
    newname = newname + '.' + originalExtname
    await gfs.files.update({'_id': ObjectID(id)},{$set: {filename: newname}})
    return newname
}

const deleteFiles = async (body) => {
    let filename = await removeFileById(body.childID)
    await itemCtrl.removeChild(body.parentID,body.childID)
    return filename
}

const searchFiles = async (text) => {
    let files = await gfs.files.find({filename: {$regex: text,$options : 'i'}}).toArray()
    let output = []
    for(file of files){
        let temp = {id: file._id}
        temp.filename = file.filename
        temp.size = parseFloat(file.length/1024/1024).toFixed(2).toString()+' M'
        output.push(temp)
    }
    return output
}

const getListOfFiles = async (text) => {
    let files = await gfs.files.find({filename: {$regex: text,$options : 'i'}}).toArray()
    let output = []
    for(file of files)
        output.push(file.filename)
    return output
}
module.exports = {
    gfs,
    upload,
    getFiles,
    downloadFile,
    removeFileById,
    deleteFiles,
    renameFile,
    searchFiles,
    getListOfFiles
}