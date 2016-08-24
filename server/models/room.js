var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RoomSchema   = new Schema({
  // the name of the room
  name: String,

  // the room outline in 2D from above
  outline: Array,

  // the maximum height of the room
  height: Number
});

module.exports = mongoose.model('Room', RoomSchema);
