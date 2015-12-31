var Light = require('../models/light');

module.exports = function(router) {

  router.route('/lights')

    // get lights (GET http://localhost:4020/api/lights)
    .get(function(req, res) {
      console.log('get lights');

      Light.find(function(err, lights) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        res.json(lights);
      });
    })


    // create a light (POST http://localhost:4020/api/lights)
    .post(function(req, res) {
      console.log('create light');

      var light = new Light();
      light.name = req.body.name;

      light.save(function(err) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        res.json({ message: 'Light created!' });
      });
    });


  router.route('/lights/:light_id')

    // get the light with that id (GET http://localhost:4020/api/lights/:light_id)
    .get(function(req, res) {
      console.log('get light ' + req.params.light_id);

      Light.findOne({ id: req.params.light_id }, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        if (light) {
          res.json(light);
        } else {
          res.status(404).send('Not found');
        }
      });
    })

    // update the light with this id (PUT http://localhost:4020/api/lights/:light_id)
    .put(function(req, res) {
      console.log('update light ' + req.params.light_id);

      Light.findById(req.params.light_id, function(err, light) {

        if (err) {
          console.error(err);
          res.send(err);
        }

        light.name = req.body.name;

        light.save(function(err) {
          if (err) {
            console.error(err);
            res.send(err);
          }

          res.json({ message: 'Light updated!' });
        });

      });
    })

    // delete the light with this id (DELETE http://localhost:4020/api/lights/:light_id)
    .delete(function(req, res) {
      console.log('delete light ' + req.params.light_id);

      Light.remove({
        _id: req.params.light_id
      }, function(err, light) {
        if (err) {
          console.error(err);
          res.send(err);
        }

        res.json({ message: 'Successfully deleted' });
      });
    });

};