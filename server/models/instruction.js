var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var InstructionSchema   = new Schema({
  // the name of the room
  name: String,

  // the ID of the handler to be targeted
  handlerID: String,

  // the inclusive start of the targeted index range
  indexRangeStart: Number,

  // the inclusive end of the targeted index range
  indexRangeEnd: Number,

  // the pattern data for the instruction, a list of lists of colors
  patterns: Array,

  // whether the instruction should be removed after execution or not
  looping: Boolean,

  // the application mode of the instruction, 0 = set (default) 1 = add 2 = multiply 3 = substract
  mode: Number
});

InstructionSchema.methods.addFillPattern = function(color) {
  var pattern = [];

  for (var i=this.indexRangeStart; i<=this.indexRangeEnd; i++) {
    pattern.push(color);
  }

  this.pattern.push(pattern);
};

module.exports = mongoose.model('Instruction', InstructionSchema);
