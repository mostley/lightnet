var Animation = require('../models/animation');


module.exports = function (router) {

  router.route('/animations')

    // get animations (GET http://localhost:4020/api/animations)
    .get(function (req, res) {
      console.log('get animations');

      Animation.find(function (err, animations) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json(animations);
      });
    })


    // create a animation (POST http://localhost:4050/api/animations)
    .post(function(req, res) {
      console.log('create animation');

      var animation = new Animation(req.body);

      animation.save(function(err) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json({ message: 'Animation created!' });
      });
    });


  router.route('/animations/:animation_id')

    // get the animation with that id (GET http://localhost:4050/api/animations/:animation_id)
    .get(function(req, res) {
      console.log('get animation ' + req.params.animation_id);

      Animation.findById(req.params.animation_id, function(err, animation) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        if (animation) {
          res.json(animation);
        } else {
          console.log("< no animation with that ID yet.");
          res.status(404).send('Not found');
        }
      });
    })

    // update the animation with this id (PUT http://localhost:4050/api/animations/:animation_id)
    .put(function(req, res) {
      console.log('update animation ' + req.params.animation_id);

      User.update({ _id: req.params.animation_id }, req.body, function(err) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json({ message: 'Animation updated!' });
      });
    })

    // delete the animation with this id (DELETE http://localhost:4050/api/animations/:animation_id)
    .delete(function(req, res) {
      console.log('delete animation ' + req.params.animation_id);

      Animation.remove({
        _id: req.params.animation_id
      }, function(err) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json({ message: 'Successfully deleted' });
      });
    });

};