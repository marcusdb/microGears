var uri = 'mongodb://localhost/test';
var mongoose = require('mongoose');
mongoose.createConnection(uri, { server: { poolSize: 4 }});

mongoose.Model.prototype.find=

module.exports=mongoose