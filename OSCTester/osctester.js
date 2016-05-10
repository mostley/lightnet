var osc = require("osc");

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var oscPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121
});

oscPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", oscPort.options.localPort);
    });
});

oscPort.on("message", function (oscMessage) {
    var address = oscMessage.address;
    var value = oscMessage.args[0];

    console.log(address, value);
});

oscPort.on("error", function (err) {
    console.log(err);
});

oscPort.open();

var val = 1;
setInterval(function() {
    oscPort.send({
        address: "/ard/aaa",
        args: val
    });

    val = val === 1 ? 0 : 1;
}, 1000);