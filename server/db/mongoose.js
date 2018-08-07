const mongoose = require('mongoose')
const config = require('../../config')

mongoose.Promise = global.Promise
mongoose.connect(config.MONGO_URI || process.env.MONGO_URI,{ useNewUrlParser: true })

module.exports = {mongoose}
