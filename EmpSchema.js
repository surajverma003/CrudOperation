const mongoose = require('mongoose');

const empSchema = new mongoose.Schema({
    empname: String,
    email: String,
    password: String
});

module.exports = mongoose.model('emp', empSchema);