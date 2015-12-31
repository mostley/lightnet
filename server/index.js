var mongoose   = require('mongoose');
var express    = require('express');
var bodyParser = require('body-parser');
var docs = require("express-mongoose-docs");

var config = require('./config');
var lightRoutes = require('./routes/lightroutes');
var controlRoutes = require('./routes/controlroutes');
var handlerRoutes = require('./routes/handlerroutes');
var discoverer = require('./discoverer');
var pinger = require('./pinger');

// SETUP
// =============================================================================

console.log("LightNet Version '" + require('./package.json').version + "'");

mongoose.connect(config.dbUrl, function(err) {
  if (err) {
    console.log("Failed to initialize Database. Ensure connectivity to '" + config.dbUrl + "' (" + err + ")");
    throw err;
  }
});

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
docs(app, mongoose);

var port = process.env.PORT || config.appPort;

// ROUTES
// =============================================================================
var router = express.Router();

router.get('/', function(req, res) {
  console.log('route / hit');
  res.json({ message: 'Welcome to the LightNet. A LabNet Service provided to you by FabLab Karlsruhe e.V.' });
});

lightRoutes(router);
controlRoutes(router);
handlerRoutes(router);

// REGISTER ROUTES -------------------------------
app.use('/api', router);

// START SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// START UDP Broadcast
// =============================================================================
discoverer();

// START TCP Light Handler Pinging
// =============================================================================
pinger();