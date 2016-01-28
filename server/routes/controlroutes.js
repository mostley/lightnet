var Light = require('../models/light');
var Vector3 = require('../models/math/vector3');

var buffer = {};
var lightsources = {};
var lightsourceIdCounter = 0;

module.exports = function(router) {

  router.route('/lightsources')

    // get control (GET http://localhost:4020/api/lightsources)
    .get(function(req, res) {
      console.log('get lightsources');

      res.json(lightsources);
    })


    // create a lightsource (POST http://localhost:4020/api/lightsources)
    .post(function(req, res) {
      console.log('create lightsource');

      var lightsource = Object.assign(req.body, {
        id: lightsourceIdCounter++,
        p: [0, 0, 0],
        r: 1,
        s: 1,
        c: [0, 0, 0]
      });

      lightsources[lightsource.id] = lightsource;
    });


  router.route('/lightsources/:lightsource_id')

    // get the lightsource with that id (GET http://localhost:4050/api/lightsources/:lightsource_id)
    .get(function(req, res) {
      console.log('get lightsource ' + req.params.lightsource_id);

      var result = lightsources[req.params.lightsource_id];
      if (!result) {
        res.status(404).send("Not Found!");
      } else {
        res.json(result);
      }
    })

    // update the lightsource with this id (PUT http://localhost:4050/api/lightsources/:lightsource_id)
    .put(function(req, res) {
      console.log('update lightsource ' + req.params.lightsource_id);

      var result = lightsources[req.params.lightsource_id];

      if (!result) {
        res.status(404).send("Not Found!");
      } else {
        lightsources[req.params.lightsource_id] = Object.assign(result, req.body);
        res.json({ message: 'successfully updated' });
      }
    })

    // delete the lightsource with this id (DELETE http://localhost:4050/api/lightsources/:lightsource_id)
    .delete(function(req, res) {
      console.log('delete lightsource ' + req.params.lightsource_id);

      var result = lightsources[req.params.lightsource_id];

      if (!result) {
        res.status(404).send("Not Found!");
      } else {
        delete lightsources[req.params.lightsource_id];
        res.json({ message: 'Successfully deleted' });
      }
    });


  router.route('/control')

    // get control (GET http://localhost:4020/api/control)
    .get(function(req, res) {
      console.log('get control');

      res.json(buffer);
    })


    // proxy lightdata to the relevant positions (POST http://localhost:4020/api/control)
    .post(function(req, res) {
      console.log('set pixeldata');

      var data = {};
      for (var i in req.body) {
        var pixel = req.body[i];

        if (!data[pixel.x]) { data[pixel.x] = {}; }
        if (!buffer[pixel.x]) { buffer[pixel.x] = {}; }
        if (!data[pixel.x][pixel.y]) { data[pixel.x][pixel.y] = {}; }
        if (!buffer[pixel.x][pixel.y]) { buffer[pixel.x][pixel.y] = {}; }

        data[pixel.x][pixel.y][pixel.z] = pixel.color;
        buffer[pixel.x][pixel.y][pixel.z] = pixel.color;
      }

      Light.find(function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        for (var i=0; i<lights.length; i++) {
          var light = lights[i];

          if (data[light.x] && data[light.x][light.y] && data[light.x][light.y][light.z]) {
            light.setColor(data[light.x][light.y][light.z]);
          }
        };
      });

    });


  router.route('/control/:x/:y/:z')

    // get the color of the light at those coordinates (GET http://localhost:4020/api/control/:x/:y/:z)
    .get(function(req, res) {
      var pos = new Vector3(req.params.x, req.params.y, req.params.z);
      var precise = !!req.query.precise;
      if (!precise) {
        pos.floor();
      }
      console.log('get light color at ' + pos.toString());

      if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z]) {
        console.warn('result: ', buffer[pos.x][pos.y][pos.z]);
        res.json(buffer[pos.x][pos.y][pos.z]);
      } else {
        console.warn('no light found at that position');
        res.status(404).send('Not found');
      }
    })

    // update the light at those coordinates (PUT http://localhost:4020/api/control/:x/:y/:z?precise=:precise)
    .put(function(req, res) {
      var pos = new Vector3(parseFloat(req.params.x), parseFloat(req.params.y), parseFloat(req.params.z));
      var precise = !!req.body.precise;
      var color = [req.body.r, req.body.g, req.body.b];
      if (!precise) {
        pos.floor();
      }
      console.log('update light color at ' + pos.toString() + ' (precise: ' + precise + ') to ', color);


      if (!buffer[pos.x]) { buffer[pos.x] = {}; }
      if (!buffer[pos.x][pos.y]) { buffer[pos.x][pos.y] = {}; }
      buffer[pos.x][pos.y][pos.z] = color;

      Light.find(function(err, lights) {
        console.log(lights.length + " lights in total");

        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        var lightCount = 0;

        for (var i=0; i<lights.length; i++) {
          if (lights[i].isAt(pos, precise)) {
            lights[i].setColor(color);
            lightCount++;
          }
          break;
        };

        res.json({ message: lightCount + ' Lights updated!' });
      });
    });


  router.route('/lights/:light_id/control')

    // get the effective color of the light by ID (GET http://localhost:4020/api/lights/:light_id/control)
    .get(function(req, res) {
      console.log('get control light ' + req.params.light_id);

      Light.findById(req.params.light_id, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        var pos = light.getVector();

        var color = [0, 0, 0];
        if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z] && buffer[pos.x][pos.y][pos.z]) {
          color = buffer[pos.x][pos.y][pos.z];
        } else {
          pos.floor();
          if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z] && buffer[pos.x][pos.y][pos.z]) {
            color = buffer[pos.x][pos.y][pos.z];
          }
        }

        res.json(color);
      });
    })

    // update the light by ID (PUT http://localhost:4020/api/lights/:light_id/control)
    .put(function(req, res) {
      var color = [req.body.r, req.body.g, req.body.b];
      var precise = !!req.body.precise;
      console.log('control light ' + req.params.light_id);

      Light.findById(req.params.light_id, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        var pos = light.getVector();
        if (!precise) {
          pos.floor();
        }

        if (!buffer[pos.x]) { buffer[pos.x] = {}; }
        if (!buffer[pos.x][pos.y]) { buffer[pos.x][pos.y] = {}; }
        buffer[pos.x][pos.y][pos.z] = color;

        light.setColor(color);

        res.json({ message: 'Light updated!' });
      });
    });


  router.route('/handlers/:handler_id/control')

    // get the effective color of every light by handler ID (GET http://localhost:4020/api/lights/:light_id/control)
    .get(function(req, res) {
      console.log('get control handler ' + req.params.handler_id);

      Light.find({ handlerID: req.params.handler_id }, function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        var colors = {};

        for (var i in lights) {
          var light = lights[i];

          var pos = light.getVector();

          var color = [0, 0, 0];
          if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z] && buffer[pos.x][pos.y][pos.z]) {
            color = buffer[pos.x][pos.y][pos.z];
          } else {
            pos.floor();
            if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z] && buffer[pos.x][pos.y][pos.z]) {
              color = buffer[pos.x][pos.y][pos.z];
            }
          }

          colors[light.index] = color;
        }

        res.json(colors);
      });
    });

};