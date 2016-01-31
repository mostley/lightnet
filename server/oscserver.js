module.exports = function(app) {
    var osc = require("osc"),
        http = require("http"),
        WebSocket = require("ws");

    server = app.listen(8081);

    var wss = new WebSocket.Server({
        server: server
    });

    wss.on("connection", function (socket) {
        var socketPort = new osc.WebSocketPort({
            socket: socket
        });

        socketPort.on("message", function (oscMsg) {
            console.log("An OSC Message was received!", oscMsg);
        });
    });

    var udpPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: 57121
    });

    udpPort.on("bundle", function (oscBundle) {
        console.log("An OSC bundle just arrived!", oscBundle);
    });

    udpPort.open();
};