# lightnet
Lightmanagement Server to control room lighting

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