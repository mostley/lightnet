var Light = require('../models/light');

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


  router.route('/control/:x/:y/:z')

    // get the color of the light at those coordinates (GET http://localhost:4020/api/control/:x/:y/:z)
    .get(function(req, res) {
      var x = req.params.x;
      var y = req.params.y;
      var z = req.params.z;
      console.log('get light color at [' + x + ':' + y + ':' + z + ']');

      if (buffer[x] && buffer[x][y] && buffer[x][y][z]) {
        res.json(buffer[x][y][z]);
      } else {
        res.status(404);
      }
    })

    // update the light at those coordinates (PUT http://localhost:4020/api/control/:x/:y/:z)
    .put(function(req, res) {
      var x = req.params.x;
      var y = req.params.y;
      var z = req.params.z;
      var color = req.params.color;
      console.log('update light color at [' + x + ':' + y + ':' + z + ']');

      Light.find({ x: x, y: y, z: z}, function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        for (var i=0; i<lights.length; i++) {
          lights[i].setColor(color);
        };
      });
    });

};