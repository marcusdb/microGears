var requireDir = require('require-dir');
requireDir('../examples/services');
requireDir('../examples/plugins');
var MicroGears = require('../src/index');
var express = require('express');
var app = express();

app.get('/user/:id', function (req, res) {
    MicroGears.userService.findUserById(req.params.id).then(function (result) {
        res.send(result);
    }).catch(function (error) {
        res.send(error.stack);
    });

});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
});

