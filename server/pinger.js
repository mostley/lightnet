var ping = require('ping');

var Light = require('./models/light');
var config = require('./config');

function setLightActiveByHandler(handler, active) {
  Light.find({ handler: handler }, function(err, lights) {
    if (err) {
      console.error(err);
      return;
    }

    for (var i in lights) {
      var light = lights[i];
      if (light.active !== active) {
        console.log('setting light active', active, light._id);
        light.active = active;
        if (!active) {
          light.deactivated = new Date();
        }

        light.save(function(err, light) {
          if (err) {
            console.error(err);
          }
        });
      }
    }
  });
}

function executePing() {
  Light.distinct('handler', function(err, handlerIps) {
      if (err) {
        console.error(err);
        setTimeout(executePing, config.machinePingInterval);
        return;
      }

      for (var i in handlerIps) {
        var ip = handlerIps[i];

        console.log("Pinging " + ip);
        ping.sys.probe(ip, function (isAlive) {
          if (!isAlive) {
            setLightActiveByHandler(ip, false);
          } else {
            setLightActiveByHandler(ip, true);
          }
        });
      }

      setTimeout(executePing, config.machinePingInterval);
  });
}

module.exports = function() {
  setTimeout(executePing, config.machinePingInterval);
};