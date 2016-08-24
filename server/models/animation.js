var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnimationSchema   = new Schema({
  // the name of the animation
  name: String,

  // the animation data
  data: Array,

  // the duration of the animation
  duration: Number,

  // whether the animation is looping
  looping: Boolean
});

module.exports = mongoose.model('Animation', AnimationSchema);
