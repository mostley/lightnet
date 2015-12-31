var request     = require('request');
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Vector3 = require('./math/vector3');

var LightSchema   = new Schema({
    // The ID of the Room the Light is in
    room: String,

    // The Coordinates of the Light in the Room
    x: Number,
    y: Number,
    z: Number,

    // The IP of the Handler responsible for this Light
    handler: String,

    // the Handler id
    handlerID: String,

    // Some Information about the Handler.
    handlerInfo: String,

    // The type of the Handler ( 0 = TCP [default])
    handlerType: Number,

    // The version of the Handler software
    handlerVersion: String,

    // The position offset of the handler (will be added to the coordinates for addressing)
    handlerOffsetX: Number,
    handlerOffsetY: Number,
    handlerOffsetZ: Number,

    handlerGeometry: String,
    handlerGeometryWidth: Number,
    handlerGeometryHeight: Number,
    handlerGeometryLength: Number,

    // The index of the Light on the Handler
    index: Number
});

LightSchema.methods.toString = function () {
    return '[ ' + this.x + ':' + this.y + ':' + this.z + ' - ' + this.handler + '(' + this.index + ') ]'
};

LightSchema.methods.getHandlerOffset = function () {
    return new Vector3(this.handlerOffsetX, this.handlerOffsetY, this.handlerOffsetZ);
};

LightSchema.methods.getVector = function () {
    return new Vector3(this.x, this.y, this.z).add(this.getHandlerOffset());
};

LightSchema.methods.isAt = function (position, precise) {
    if (precise) {
        return this.getVector().equals(position);
    } else {
        return this.getVector().floor().equals(position);
    }
};

LightSchema.methods.updateCoordinates = function () {
    switch (this.handlerGeometry) {
        case "Cube":
            this.updateCubeCoordinates();
            break;
        default:
            console.error("Unknown handler geometry ", this.handlerGeometry);
            break;
    }
};

LightSchema.methods.updateCubeCoordinates = function () {
    this.x = this.index % this.handlerGeometry.Width;
    this.y = Math.floor(this.index / this.handlerGeometry.Width);
    this.z = Math.floor(this.y / this.handlerGeometry.Length);
};

LightSchema.methods.toHandler = function() {
    return {
        ipAddress: this.handler,
        id: this.handlerID,
        info: this.handlerInfo,
        type: this.handlerType,
        version: this.handlerVersion,
        offsetX: this.handlerOffsetX,
        offsetY: this.handlerOffsetY,
        offsetZ: this.handlerOffsetZ
    };
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
};

module.exports = mongoose.model('Light', LightSchema);
