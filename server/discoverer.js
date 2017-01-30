var os = require('os');
var dgram = require('dgram');
var config = require('./config.json');

var lightNetVersion = require('./package.json').version;

var udpClient = dgram.createSocket('udp4');

function sendMulticast() {
  var message = new Buffer("lightnet:" + (process.env.IPADRESS || config.appIP));
  udpClient.send(message, 0, message.length, config.discoveryPort, config.discoveryMulticastAddress, function(err) {
    if (err) {
      console.error(err);
      return;
    }

    //console.log('broadcasted discover message');
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
/*

def send_multicast():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    data = ("lightnet:"+IP).encode('utf-8')
    sock.sendto(data, ('224.0.0.1', 3535))
*/
