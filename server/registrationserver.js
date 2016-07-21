"use strict";

var Light = require('./models/light');

var objectAssign = require('object-assign');
var net = require('net');

var handlerPrefix = 'node_';
var PORT = 3636;

function registerHandler(handler, uniqueID, numberOfLeds, callback) {
  let handlerID = handlerPrefix + uniqueID;

  Light.find({ handlerID }, function(err, lights) {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }

    if (lights.length > 0) {
      // TODO check number of LEDS
      console.log('handler ' + handlerID + 'is already created');
      callback();
      return;
    }
    console.log('handler ' + handlerID + 'is not yet created, setting up');

    var onSaveCallback = function(err, light) {
      if (err) {
        console.error(err);
      }
    };

    let lightBase = {
      size: 1,
      active: true,
      handlerType: 1,
      handlerVersion: 'x.x.x',
      handlerOffsetX: 0,
      handlerOffsetY: 0,
      handlerOffsetZ: 0,
      handlerGeometry: 'cube',
      handlerGeometryHeight: 1,
      handlerGeometryLength: 1,
      handlerGeometryDirection1: '-xx',
      handlerGeometryDirection2: 'yy',
      handlerGeometryDirection3: 'zz',
    };

    for (var index=0; index<numberOfLeds; index++) {
      console.log('Creating Light ' + index + ' for handler ' + handler);

      var light = new Light();
      objectAssign(light, lightBase, {
        index, handler, handlerID,
        handlerGeometryWidth: numberOfLeds
      })

      light.updateCoordinates();

      light.save(onSaveCallback);
    }

    callback();
  });
}

module.exports = function(mongoose) {

  var server = net.createServer(function(socket) {
    console.log('client connected for micro registration');

    socket.on('data', function (data) {
      data = data.toString('utf8');
      console.log('micro registration received: ', data);

      let dataParts = data.split(';');
      if (dataParts.length < 3) {
        console.error('wrong number of arguments', data);
        socket.end();
        return;
      }

      let handlerIp = dataParts[0];
      let handlerID = dataParts[1];
      let numberOfLeds = dataParts[2];

      socket.end('OK');

      registerHandler(handlerIp, handlerID, numberOfLeds, function(err) {
        if (err) {
          console.error(err);
          return;
        }

        console.log('hanlder ' + handlerPrefix + handlerID + ' is registered');
      });
    });
  }).on('error', (err) => {
    console.error(err);
    // handle errors here
    throw err;
  });;

  server.listen(PORT, '0.0.0.0');
  console.log('listening on 0.0.0.0:' + PORT + ' for micro registration');
};
