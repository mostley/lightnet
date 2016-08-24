var dgram        = require('dgram');

export default class Handler {

  constructor(data) {
    this.active = data.active;
    this.room = data.room;
    this.ipAddress = data.handler;
    this.identifier = data.handlerID;
    this.info = data.handlerInfo;
    this.type = data.handlerType;
    this.version = data.handlerVersion;
    this.offsetX = data.handlerOffsetX;
    this.offsetY = data.handlerOffsetY;
    this.offsetZ = data.handlerOffsetZ;
    this.geometry = {
      type: data.handlerGeometry,
      width: data.handlerGeometryWidth,
      height: data.handlerGeometryHeight,
      length: data.handlerGeometryLength,
      direction1: data.handlerGeometryDirection1,
      direction2: data.handlerGeometryDirection2,
      direction3: data.handlerGeometryDirection3
    };
    this.numberOfLeds = this.geometry.width * this.geometry.height * this.geometry.length;
  }

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

  setPatternViaUDP(data) {
    const message = createBlobMessage(data);
    const client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, PORT, HOST, err => {
      if (err) {
        console.error(err);
      }
      console.log('UDP message sent to ' + HOST +':'+ PORT);
      client.close();
    });
  }

  setPattern(pattern) {
      if (this.type === 0) {
        console.error('bulk LED change via HTTP not supported yet');
      } else if (this.type === 1) {
        console.error('bulk LED change via OSC not supported yet');
      } else if (this.type === 2) {
        this.setPatternViaUDP(pattern);
      } else {
        console.error('unknown handler type ', this.type);
      }
  };
}
