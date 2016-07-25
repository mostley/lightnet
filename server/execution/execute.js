var instruction = require('../models/instruction');
var config = require('../config');

var executors = [];

function spawnExecutors() {
  instruction.find((err, instructions) => {
    if (err) {
      console.error(err);
      return;
    }


  });
}

module.exports = function () {
    setTimeout(spawnExecutors, config.executorSpawnerIntervall);
};
