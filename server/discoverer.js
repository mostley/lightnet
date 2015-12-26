var os = require('os');
var dgram = require('dgram');
var config = require('./config');

var lightNetVersion = require('./package.json').version;

var udpClient = dgram.createSocket('udp4');
udpClient.bind(config.discoveryPort, function() {
  udpClient.setBroadcast(true);
});

module.exports = function() {
  setInterval(function() {
    var msgData = { hostname: os.hostname(), name: 'LightNet', version: lightNetVersion };
    var message = new Buffer(JSON.stringify(msgData));
    udpClient.send(message, 0, message.length, config.discoveryPort);
  }, config.discoveryInterval);
};