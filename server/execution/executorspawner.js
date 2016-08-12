var instruction = require('../models/instruction');
var config = require('../config');

var execute = require('./execute');

var executors = {};

var instructionCache = {};

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

function stopExecutor(handlerID) {
  clearInterval(executors[handlerID]);
}

function spawnExecutors() {
  instruction.find((err, instructions) => {
    if (err) {
      console.error(err);
      return;
    }

    let newHandlerIds = [];
    instructions.forEach(inst => {
      if (!instructionCache[inst.handlerID]) {
        instructionCache[inst.handlerID]  = {}
      }

      if (!inst.equals(instructionCache[inst.handlerID][inst.id])) {
        console.log('[ExecutorSpawner] found new or changed instruction with id', inst.id);
        instructionCache[inst.handlerID][inst.id] = inst;
        newHandlerIds.push(inst.handlerID);
      }
    });

    newHandlerIds.forEach(handlerId => {
      if (executors[handlerID]) {
        stopExecutor(handlerID)
      }

      spawnExecutor(handlerID)
        .then(timer => {
          executors[handlerID] = timer;
        })
        .catch(err => {
          console.error(err);
        });
    });
  });

  setTimeout(spawnExecutors, config.executorSpawnerIntervall);
}

spawnExecutors();
