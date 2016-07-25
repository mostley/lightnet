var instruction = require('../models/instruction');
var config = require('../config');

var executor = require('./executor');

var executors = {};

function spawnExecutor(handlerID, listOfInstructions) {
}

function spawnExecutors() {
  instruction.find((err, instructions) => {
    if (err) {
      console.error(err);
      return;
    }

    let instructionsPerHandler = {};
    instructions.forEach(instruction => {
      var executorBatchID = getExecutorBatchID(instruction);

      if (!instructionsPerHandler[instruction.handlerID]) {
        instructionsPerHandler[instruction.handlerID] = [];
      }

      instructionsPerHandler[instruction.handlerID].push(instruction);
    });

    for (var handlerID in instructionsPerHandler) {
      executors[handlerID] = spawnExecutor(instruction.handlerID, instructionsPerHandler[instruction.handlerID]);
    }
  });
}

module.exports = function () {
    setTimeout(spawnExecutors, config.executorSpawnerIntervall);
};
