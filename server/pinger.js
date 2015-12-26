var config = require('./config');

module.exports = function() {
  setInterval(function() {
  }, config.discoveryInterval);
};