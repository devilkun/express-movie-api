var mongoose = require('mongoose');
var url = 'mongodb://localhost/movieServer';
mongoose.connect(url);
module.exports = mongoose;