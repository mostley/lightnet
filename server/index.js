var child_process = require('child_process');
var mongoose   = require('mongoose');
var morgan = require('morgan');
var express    = require('express');
var bodyParser = require('body-parser');
var docs = require("express-mongoose-docs");

var config = require('./config.json');
var lightRoutes = require('./routes/lightroutes');
var controlRoutes = require('./routes/controlroutes');
var handlerRoutes = require('./routes/handlerroutes');
var roomRoutes = require('./routes/roomroutes');
var animationRoutes = require('./routes/animationroutes');
var discoverer = require('./discoverer');
var pinger = require('./pinger');
var lightcleaner = require('./lightcleaner');
var registrationServer = require('./registrationserver');

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
app.use(morgan('combined'))

var expressWs = require('express-ws')(app);

var port = process.env.PORT || config.appPort;

// ROUTES
// =============================================================================
var router = express.Router();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

router.get('/', function(req, res) {
  console.log('route / hit');
  res.json({ message: 'Welcome to the LightNet. Your friendly neighborhood Light Management Server' });
});

lightRoutes(router, app, expressWs);
controlRoutes(router, app, expressWs);
handlerRoutes(router, app, expressWs);
roomRoutes(router, app, expressWs);
animationRoutes(router, app, expressWs);

// REGISTER ROUTES -------------------------------------------------------------
app.use('/api', router);

// START SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// START the registration server
// =============================================================================
registrationServer(mongoose);

// START UDP Broadcast
// =============================================================================
discoverer();

// START TCP Light Handler Pinging
// =============================================================================
pinger();

// START Cleanup Task for old inactive lights
// =============================================================================
lightcleaner();

/*executioner = child_process.fork('./execution/executionspawner');

process.on('exit', function() {
  executioner.kill();
});
*/
