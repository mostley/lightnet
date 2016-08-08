var instruction = require('../models/instruction');
var config = require('../config');

var execute = require('./execute');

var executors = {};

/*
 * TODO:
 * - regularily check if instructions changed and change executors
 * - spawn oneTime executors on server start
 * - respawn oneTime executors on handler rediscover
*/

function spawnExecutor(handlerID, listOfInstructions) {
  console.log('[Executor] spawning executor');
  return execute(handlerID, listOfInstructions);
}

function spawnExecutors() {
  instruction.find((err, instructions) => {
    if (err) {
      console.error(err);
      return;
    }

    let handlerIds = [];
    instructions.forEach(instruction => {
      if (handlerIds.indexOf(instruction.handlerID) < 0) {
        handlerIds.push(instruction.handlerID);
      }
    });

    handlerIds.forEach(handlerId => {
      executors[handlerID] = spawnExecutor(handlerID);
    });
  });
}

module.exports = function () {
    setTimeout(spawnExecutors, config.executorSpawnerIntervall);
};
