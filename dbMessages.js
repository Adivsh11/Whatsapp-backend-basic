
const mongoose = require('mongoose');


const whatsppSchema = mongoose.Schema({
    message : String,
    name : String,
    timestamp : String,
    received : Boolean,

    

});


module.exports = mongoose.model('messagecontents', whatsppSchema );