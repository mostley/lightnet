var Light = require('../models/light');


module.exports = function(router) {

  router.route('/handlers')

    // TODO figure out how this is possible with mongoose
    // get handlers (GET http://localhost:4020/api/handlers)
    .get(function(req, res) {
      console.log('get handlers');

      Light.find(function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        var handlers = {};
        for (var i in lights) {
          var light = lights[i];

          if (light) {
            if (!handlers[light.handlerID]) {
              handlers[light.handlerID] = light.toHandler();
            }
          }
        }

        res.json(Object.keys(handlers).map(i => handlers[i]));
      });
    })

    // create an handler (POST http://localhost:4020/api/handlers)
    .post(function(req, res) {
      console.log('create an handler', req.body);

      var onSaveCallback = function(err, light) {
        if (err) {
          console.error(err);
        }
      };

      for (var index=0; index<req.body.handlerNumberOfLights; index++) {
        var light = new Light();
        light.index = index;
        light.size = req.body.lightSize;
        light.active = true;
        light.handler = req.body.handler;
        light.handlerID = req.body.handlerID;
        light.handlerInfo = req.body.handlerInfo || '';
        light.handlerType = req.body.handlerType || 1;
        light.handlerVersion = req.body.handlerVersion || '1.0';
        light.handlerOffsetX = req.body.handlerOffsetX || 0;
        light.handlerOffsetY = req.body.handlerOffsetY || 0;
        light.handlerOffsetZ = req.body.handlerOffsetZ || 0;
        light.handlerGeometry = req.body.handlerGeometry;
        light.handlerGeometryWidth = req.body.handlerGeometryWidth;
        light.handlerGeometryHeight = req.body.handlerGeometryHeight || 1;
        light.handlerGeometryLength = req.body.handlerGeometryLength || 1;
        light.handlerGeometryDirection1 = req.body.handlerGeometryDirection1;
        light.handlerGeometryDirection2 = req.body.handlerGeometryDirection2;
        light.handlerGeometryDirection3 = req.body.handlerGeometryDirection3;

        light.updateCoordinates();

        light.save(onSaveCallback);
      }

      res.json({ message: 'handler created!' });
    });


  router.route('/handlers/:handler_id')

    // get the handler with that id (GET http://localhost:4020/api/handlers/:handler_id)
    .get(function(req, res) {
      console.log('get handler ' + req.params.handler_id);

      Light.findOne({ handlerID: req.params.handler_id }, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        if (light) {
          var handler = light.toHandler();
          Light.count({ handlerID: req.params.handler_id }, function(err, lightCount) {
            if (err) {
              console.error(err);
              res.send(err);
              return;
            }

            handler.lightCount = lightCount;
            res.json(handler);
          });
        } else {
          console.log("< no handler with that ID yet.");
          res.status(404).send('Not found');
        }
      });
    })

    // update the handler with that id (PUT http://localhost:4020/api/handlers/:handler_id)
    .put(function(req, res) {
      console.log('update handler ' + req.params.handler_id, req.body);

      Light.update({ handlerID: req.params.handler_id }, { $set: req.body }, function(err, result) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        res.json({ message: 'handler successfully updated.' });
      });
    })

    // delete the handler with that id (DELETE http://localhost:4020/api/handlers/:handler_id)
    .delete(function(req, res) {
      console.log('delete handler ' + req.params.handler_id);

      Light.find({ handlerID: req.params.handler_id }).remove(function(err, result) {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }

        res.json({ message: 'handler successfully removed.' });
      });
    });

};
