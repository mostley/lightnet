var Light = require('./models/light');
var config = require('./config');

function cleanupOldLights() {
  console.log("Start cleaning up old inactive lights");

  var cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes()-5);
  Light.find({deactivated: {$lt: cutoff}, active: false}, function (err, oldLights) {
      if (err) {
        console.error(err);
        setTimeout(cleanupOldLights, config.cleanupOldInterval);
        return;
      }

      if (oldLights.length > 0) {

        var idList = oldLights.map(function(oldLight) { return oldLight._id; });

        console.log('removing ' + idList.length + ' lights');

        Light.remove({ _id: {$in: idList }}, function(err) {
          if (err) {
            console.error(err);
          }
        });
      } else {
        console.log('no old inactive lights found.');
      }

      setTimeout(cleanupOldLights, config.cleanupOldInterval);
  });
}

module.exports = function() {
  setTimeout(cleanupOldLights, config.cleanupOldInterval);
};
