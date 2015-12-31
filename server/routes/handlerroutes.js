var Light = require('../models/light');


module.exports = function(router) {

  router.route('/handlers')

    // get handlers (GET http://localhost:4020/api/handlers)
    .get(function(req, res) {
      console.log('get handlers');

      Light.distinct('handlerID', function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        var handlers = lights.map(function(light) { return light.toHandler(); });

        res.json(handlers);
      });
    })

    // create an handler (POST http://localhost:4020/api/handlers)
    .post(function(req, res) {
      console.log('create an handler',req.body);

      for (var index=0; index<req.body.handlerNumberOfLights; index++) {
        var light = new Light();
        light.index = index;
        light.handler = req.body.handler;
        light.handlerID = req.body.handlerID;
        light.handlerInfo = req.body.handlerInfo;
        light.handlerType = req.body.handlerType;
        light.handlerVersion = req.body.handlerVersion;
        light.handlerOffsetX = req.body.handlerOffsetX;
        light.handlerOffsetY = req.body.handlerOffsetY;
        light.handlerOffsetZ = req.body.handlerOffsetZ;
        light.handlerGeometry = req.body.handlerGeometry;
        light.handlerGeometryWidth = req.body.handlerGeometryWidth;
        light.handlerGeometryHeight = req.body.handlerGeometryHeight;
        light.handlerGeometryLength = req.body.handlerGeometryLength;

        light.updateCoordinates();

        light.save(function(err, light) {
          if (err) {
            console.error(err);
          }
        });
      }

      res.json({ message: 'handler created!' });
    });


  router.route('/handlers/:handler_id')

    // get the handler with that id (GET http://localhost:4020/api/handlers/:handler_id)
    .get(function(req, res) {
      console.log('get handler ' + req.params.handler_id);

      //TODO find out why this does not work
      Light.findOne({ handlerID: req.params.handler_id }, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        if (light) {
          var handler = light.toHandler();
          Light.count({ handlerID: req.params.handler_id }, function(err, lightCount) {
            if (err) {
              console.error(err);
              res.send(err);
            }

            handler.lightCount = lightCount;
            res.json(handler);
          });
        } else {
          console.log("< no handler with that ID yet.");
          res.status(404).send('Not found');
        }
      });
    });

};