var HOST = process.argv[2]
var PORT = 2525;
console.log(HOST);
numberOfLeds = 255
white = [255,255,255];
black = [0,0,0];

function createBlobMessage(data) {
  var result = new Buffer(data.length*3);

  var n = 0;
  for (var i=0; i<data.length; i++) {
    var c = data[i];
    //GRB
    result[n+0] = c[1];
    result[n+1] = c[0];
    result[n+2] = c[2];
    n += 3;
  }

  return result
}

function all(color) {
  var result = [];
  for (var i=0; i<numberOfLeds; i++) {
    result.push(color);
  }
  return result;
}

const dgram = require('dgram');
const message = createBlobMessage(all(black));
console.log(message.length);
const client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, err => {
  if (err) {
    console.error(err);
  }
  console.log('UDP message sent to ' + HOST +':'+ PORT);
  client.close();
});
