var express = require('express');

var config = require('./config');

var app = express();

app.use(express.static('public'));

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});