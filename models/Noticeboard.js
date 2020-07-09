var mongoose = require('mongoose')

var noticeboardSchema = mongoose.Schema({
    title : {
        type : String,
        required: true
    },
    description : {
        type : String,
        required: true
    },
    email : {
        type : String,
        required : true
    },
    author : {
        type : String,
        required : true
    },
    createAt : {
        type : Date,
        default : Date.now
    }
})

var Noticeboard = mongoose.model('noticeboard', noticeboardSchema)
module.exports = Noticeboard