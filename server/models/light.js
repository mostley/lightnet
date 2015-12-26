var request     = require('request');
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LightSchema   = new Schema({
    // The ID of the Room the Light is in
    room: String,

    // The Coordinates of the Light in the Room
    x: Number,
    y: Number,
    z: Number,

    // The IP of the Handler responsible for this Light
    handler: String,

    // Some Information about the Handler.
    handlerInfo: String,

    // The type of the Handler ( 0 = TCP [default])
    handlerType: Number,

    // The version of the Handler software
    handlerVersion: String,

    // The index of the Light on the Handler
    index: Number
});

LightSchema.methods.toString = function () {
    return '[ ' + this.x + ':' + this.y + ':' + this.z + ' - ' + this.handler + '(' + this.index + ') ]'
};

LightSchema.methods.setColor = function (color) {
    console.log('setting light color for ' + this.toString() + ' to ' + color);

    request
        .post(this.handler)
        .form({
            index: this.index,
            color: color
        })
        .on('error', function(err) {
            console.error(err);
        })
        .on('response', function(response) {
            console.log("Result of Light change: " + response.statusCode);
        });
    });
};

module.exports = mongoose.model('Light', LightSchema);
