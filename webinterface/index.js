var express = require('express');
var partials = require('hogan-express-partials');

var config = require('./config');

var app = express();

app.set('views', './views');
app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
//app.enable('view cache');
app.use(partials.middleware());

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index');
});

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Lightnet Webinterface listening at http://%s:%s', host, port);
});