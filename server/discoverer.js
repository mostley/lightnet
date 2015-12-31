var os = require('os');
var dgram = require('dgram');
var config = require('./config');

var lightNetVersion = require('./package.json').version;

var udpClient = dgram.createSocket('udp4');

function sendMulticast() {
  var msgData = {
    hostname: os.hostname(),
    name: 'LightNet',
    version: lightNetVersion,
    ip: process.env.IPADRESS || config.appIP,
    port: process.env.PORT || config.appPort
  };

  var message = new Buffer(JSON.stringify(msgData));
  udpClient.send(message, 0, message.length, config.discoveryPort, config.discoveryMulticastAddress, function(err) {
    if (err) {
      console.error(err);
      return;
    }

    console.log('broadcasted discover message', msgData);
  });
}

module.exports = function() {
  udpClient.bind(config.discoverySrcPort, function(err) {
    if (err) {
      console.error(err);
      return;
    }

    setInterval(sendMulticast, config.discoveryInterval);
  });
};