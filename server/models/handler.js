
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

  setColorViaHTTP(color) {
    console.log('setting light color for ' + this.toString() + ' to ' + color + ' via http');

    //TODO bundle

    request
      .post("http://" + this.handler + "/")
      .form({
          index: this.index,
          r: color[0],
          g: color[1],
          b: color[2]
      })
      .on('error', function(err) {
          console.error(err);
      })
      .on('response', function(response) {
          console.log("Result of Light change: " + response.statusCode);
      });
  }

  setColorViaOSC(color) {
    console.log('setting light color for ' + this.toString() + ' to ' + color + ' via OSC');

    //TODO bundle

    var oscSocket = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: config.oscPort
    });
    oscSocket.on("error", function (error) {
        console.log("An error occurred: ", error.message);
    });
    oscSocket.open();
    oscSocket.send({
      address: "/led",
      args: [{
        type: "i",
        value: this.index
      },{
        type: "r",
        value: [color[0], color[1], color[2], 255]
      }]
    }, this.handler, config.oscSrcPort);
    oscSocket.close();
  }

  setColor(color) {
      if (this.type === 0) {
        this.setColorViaHTTP(color);
      } else if (this.type === 1) {
        this.setColorViaOSC(color);
      } else {
        console.error('unknown handler type ', this.type);
      }
  };
}
