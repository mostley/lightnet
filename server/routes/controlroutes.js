var Light = require('../models/light');
var Vector3 = require('../models/math/vector3');

var buffer = {};

module.exports = function(router) {

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
        }

        for (var i=0; i<lights.length; i++) {
          var light = lights[i];

          if (data[light.x] && data[light.x][light.y] && data[light.x][light.y][light.z]) {
            light.setColor(data[light.x][light.y][light.z]);
          }
        };
      });

    });


  router.route('/control/:x/:y/:z?precise=:precise')

    // get the color of the light at those coordinates (GET http://localhost:4020/api/control/:x/:y/:z)
    .get(function(req, res) {
      var pos = new Vector3(req.params.x, req.params.y, req.params.z);
      var precise = !!req.params.precise;
      if (!precise) {
        pos.floor();
      }
      console.log('get light color at ' + pos.toString());

      if (buffer[pos.x] && buffer[pos.x][pos.y] && buffer[pos.x][pos.y][pos.z]) {
        res.json(buffer[pos.x][pos.y][pos.z]);
      } else {
        res.status(404);
      }
    })

    // update the light at those coordinates (PUT http://localhost:4020/api/control/:x/:y/:z?precise=:precise)
    .put(function(req, res) {
      var pos = new Vector3(req.params.x, req.params.y, req.params.z);
      var color = req.params.color;
      var precise = !!req.params.precise;
      if (!precise) {
        pos.floor();
      }
      console.log('update light color at ' + pos.toString());

      buffer[pos.x][pos.y][pos.z] = color;

      Light.find(function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        for (var i=0; i<lights.length; i++) {
          if (lights[i].isAt(pos, precise)) {
            lights[i].setColor(color);
          }
        };
      });
    });

};