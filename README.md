[![bitHound Overall Score](https://www.bithound.io/github/mostley/lightnet/badges/score.svg)](https://www.bithound.io/github/mostley/lightnet)

# lightnet
Lightmanagement Server to control room lighting

# Setup

You will need a recent version of node js (http://nodejs.org/).
To configure, install and start run:
```
npm install
node setup.js
```

## Features

* Discovery of handlers
* Management of available lights
* controling lights via 3 dimensional coordinate system

# Handlers

* ESP8266
  * autoconnect to Wifi (including Access Point for credentials)
  * autodiscovery (registers itself at lighnet server)
  * registers itself at DNS
  * support for WS2812, WS2801 and APA102 LED Strips

# TODO
* check whether light count has changed (in comparison with what is saved in the API) after restart
* ping handlers if still available

# Topology

* nodes (e.g. esp8266) with installed Handler
* Hub (e.g. raspberry pi zero) with installed Server
* Devices (e.g. android) with installed Client

# Handshake

* Nodes listen for multicast message on 224.0.0.1:3535
* Server multicasts a message containing "lightnet:<server-ip>"
* Nodes answer with a TCP message to <server-ip>:3636 with "<handler-ip>;<handler-id>;<numberOfLeds>\r\n"
* Server pushes the changes of the node list to the clients (TODO)
* On User interaction Client sends a POST message to the Server
