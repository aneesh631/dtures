const mongoose = require('mongoose')

let Item = mongoose.model('Item',{
    name: {
        type: String,
        required: true,
        minLenght: 1,
        trim: true
    },
    label: {
        type: String,
        required: true,
        minLenght: 1,
        trim: true
    },
    children: {
        type: Array,
        default: []
    },
    isTerminal: {
        type: Boolean,
        default: false
    },
    alias: {
        type: String,
        default: ""
    }
})
module.exports = {Item}