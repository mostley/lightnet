var request     = require('request');
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Vector3 = require('./math/vector3');

var LightSchema   = new Schema({
    // determines whether or not a light is reachable/controlable at the time (e.g. offline)
    active: Boolean,
    deactivated: Date,

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
    handlerGeometryDirection1: Number,
    handlerGeometryDirection2: Number,
    handlerGeometryDirection3: Number,

    // The dimension of the light in room units
    size: Number,

    // The index of the Light on the Handler
    index: Number
});


LightSchema.methods.setData = function(data) {
    this.active = data.active;
    this.room = data.room;
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.handler = data.handler;
    this.handlerID = data.handlerID;
    this.handlerInfo = data.handlerInfo;
    this.handlerType = data.handlerType;
    this.handlerVersion = data.handlerVersion;
    this.handlerOffsetX = data.handlerOffsetX;
    this.handlerOffsetY = data.handlerOffsetY;
    this.handlerOffsetZ = data.handlerOffsetZ;
    this.handlerGeometry = data.handlerGeometry;
    this.handlerGeometryWidth = data.handlerGeometryWidth;
    this.handlerGeometryHeight = data.handlerGeometryHeight;
    this.handlerGeometryLength = data.handlerGeometryLength;
    this.handlerGeometryDirection1 = data.handlerGeometryDirection1;
    this.handlerGeometryDirection2 = data.handlerGeometryDirection2;
    this.handlerGeometryDirection3 = data.handlerGeometryDirection3;
    this.size = data.size;
    this.index = data.index;
};

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
    if (this.handlerGeometryDirection1 === '-xx' && this.handlerGeometryDirection2 === 'yy' && this.handlerGeometryDirection3 === 'zz') {
        this.y = (Math.floor(this.index / this.handlerGeometryWidth)) * this.size;
        this.x = (this.index % this.handlerGeometryWidth) * this.size;
        if (this.y % 2 === 0) {
            this.x = (this.handlerGeometryWidth - 1) - this.x;
        }
        if (this.handlerGeometryLength > this.y) {
            this.z = (Math.floor(this.y / this.handlerGeometryLength)) * this.size;
        } else {
            this.z = this.handlerGeometryLength - 1;
        }
    } else {
        this.x = (this.index % this.handlerGeometryWidth) * this.size;
        this.y = (Math.floor(this.index / this.handlerGeometryWidth)) * this.size;
        this.z = (Math.floor(this.y / this.handlerGeometryLength)) * this.size;
    }
};

LightSchema.methods.toHandler = function() {
    return {
        id: this.handlerID,
        ipAddress: this.handler,
        info: this.handlerInfo,
        type: this.handlerType,
        version: this.handlerVersion,
        offsetX: this.handlerOffsetX,
        offsetY: this.handlerOffsetY,
        offsetZ: this.handlerOffsetZ,
        GeometryWidth: this.handlerGeometryWidth,
        GeometryHeight: this.handlerGeometryHeight,
        GeometryLength: this.handlerGeometryLength,
        GeometryDirection1: this.handlerGeometryDirection1,
        GeometryDirection2: this.handlerGeometryDirection2,
        GeometryDirection3: this.handlerGeometryDirection3
    };
};

LightSchema.methods.setColor = function (color) {
    console.log('setting light color for ' + this.toString() + ' to ' + color);

    request
        .post("http://" + this.handler + "/")
        .form({
            index: this.index,
            r: color[0],
            g: color[1],
            b: color[2]
        })
        .on('error', function(err) {
            console.error(err);
        })
        .on('response', function(response) {
            console.log("Result of Light change: " + response.statusCode);
        });
};

module.exports = mongoose.model('Light', LightSchema);
