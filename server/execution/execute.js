var instruction = require('../models/instruction');
var light = require('../models/light');
var Handler = require('../models/handler');

var fixedInterval = 100;

/*
 * TODO:
 * - send pattern to handler
 * - make this performant (seperate thread / process)
 * - pre calculate the patterns and execute in loop
 * - invalidation
 * - calculate best interval for different patterns (or fixed interval)
*/
function clamp(c, minValue, maxValue) {
  return Math.min(maxValue, Math.max(minValue, c));
}

function clampColor(c) {
  return [
      clamp(c[0], 0, 255),
      clamp(c[1], 0, 255),
      clamp(c[2], 0, 255)
  ];
}

function addColor(colorA, colorB) {
  return clampColor([
    colorA[0] + colorB[0],
    colorA[1] + colorB[1],
    colorA[2] + colorB[2]
  ]);
}

function multiplyColor(colorA, colorB) {
  return clampColor([
    colorA[0] * colorB[0],
    colorA[1] * colorB[1],
    colorA[2] * colorB[2]
  ]);
}

function substractColor(colorA, colorB) {
  return clampColor([
    colorA[0] - colorB[0],
    colorA[1] - colorB[1],
    colorA[2] - colorB[2]
  ]);
}

function applyInstructionPattern(currentInstruction, calculatedPatterns) {

  for (var index=currentInstruction.indexRangeStart; index<=currentInstruction.indexRangeEnd; index++) {
    if (currentInstruction.patterns[index]) {

      if (currentInstruction.mode === 0) { // default
        calculatedPatterns[i][index] = currentInstruction.patterns[index];
      } else if (currentInstruction.mode === 1) { // add
        calculatedPatterns[i][index] = addColor(calculatedPatterns[i][index], currentInstruction.patterns[index]);
      } else if (currentInstruction.mode === 2) { // multiply
        calculatedPatterns[i][index] = multiplyColor(calculatedPatterns[i][index], currentInstruction.patterns[index]);
      } else if (currentInstruction.mode === 3) { // substract
        calculatedPatterns[i][index] = substractColor(calculatedPatterns[i][index], currentInstruction.patterns[index]);
      } else {
        console.error('unknown instruction mode');
        return calculatedPatterns;
      }
    }
  }

  return calculatedPatterns;
}

function getHandler(handlerID) {
  return new Promise((resolve, reject) => {
    light.find({ handlerID }, (err, lights) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      if (lights.length <= 0) {
        console.error('handler not found');
        reject('NOT_FOUND');
        return;
      }

      resolve(new Handler(lights[0]));
    });
  });
}

function calculatePatterns(handler) {
  return new Promise((resolve, reject) => {
    instruction.find({ handlerID: handler.identifier }, (err, instructions) => {

      if (err) {
        console.error('Failed to calculate pattern', err);
        reject(err);
        return;
      }

      let result = null;
      let looping = false;
      let calculatedPatterns = [];

      instructions.forEach(currentInstruction => {
        for (var i=0; i<currentInstruction.patterns.length; i++) {
          if (!calculatedPatterns[i]) {
            calculatedPatterns[i] = new Array(currentInstruction.indexRangeEnd+1);
          }

          while (calculatedPatterns[i].length < currentInstruction.indexRangeEnd+1) {
            calculatedPatterns[i].push(null);
          }

          calculatedPatterns[i] = applyInstructionPattern(currentInstruction, calculatedPatterns[i]);
        }

        if (currentInstruction.looping) {
          looping = true;
        }
      });

      if (calculatedPatterns.length > 0 && calculatedPatterns.filter(p=>p.length>0).length > 0) {
        result = {
          patterns: calculatedPatterns,
          looping,
          handler
        }
      }

      resolve(result);
    });
  });
}

function prepareExecution(handlerID) {
  return getHandler(handlerID)
    .then(handler => {
      return calculatePatterns(handler);
    });
}

function run(handlerID, pattern) {
  return getHandler(handlerID).then(handler => {
    handler.setPattern(pattern);
  });
}

function execute(handlerID, looping, patterns) {
  return new Promise((resolve, reject) => {

    let currentCursor = 0;

    run(handlerID, patterns[currentCursor]);

    if (looping) {
      let timer = setInterval(() => {
        currentCursor++;
        run(handlerID, patterns[currentCursor]);
      }, fixedInterval);

      resolve(timer);
    } else {
      resolve(null);
    }
  });
}

module.exports = function(handlerID) {
  return prepareExecution(handlerID)
    .then({ handler, looping, patterns } => {
      return execute(handler, looping, patterns);
    });
};
