var Room = require('../models/room');


module.exports = function (router) {

  router.route('/rooms')

    // get rooms (GET http://localhost:4020/api/rooms)
    .get(function (req, res) {
      console.log('get rooms');

      Room.find(function (err, rooms) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json(rooms);
      });
    })


    // create a room (POST http://localhost:4050/api/rooms)
    .post(function(req, res) {
      console.log('create room');

      var room = new Room(req.body);

      room.save(function(err) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json({ message: 'Room created!' });
      });
    });


  router.route('/rooms/:room_id')

    // get the room with that id (GET http://localhost:4050/api/rooms/:room_id)
    .get(function(req, res) {
      console.log('get room ' + req.params.room_id);

      Room.findById(req.params.room_id, function(err, room) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        if (room) {
          res.json(room);
        } else {
          console.log("< no room with that ID yet.");
          res.status(404).send('Not found');
        }
      });
    })

    // update the room with this id (PUT http://localhost:4050/api/rooms/:room_id)
    .put(function(req, res) {
      console.log('update room ' + req.params.room_id);

      Room.update({ _id: req.params.room_id }, req.body, function(err) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
          return;
        }

        res.json({ message: 'Room updated!' });
      });
    })

    // delete the room with this id (DELETE http://localhost:4050/api/rooms/:room_id)
    .delete(function(req, res) {
      console.log('delete room ' + req.params.room_id);

      Room.remove({
        _id: req.params.room_id
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