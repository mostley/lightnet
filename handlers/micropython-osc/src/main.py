__ESP__ = True

import server
import config
try:
    import network, machine, pixel
except:
    print("Failed to import hardware packages, switching to no ESP mode")
    __ESP__ = False

class Main:
    def __init__(self):
        self.ledPin = 4
        self.numberOfLeds = 1
        self.pixelController = None
        self.host = 'localhost'
        self.port = 2525
        self.wlan = None

        self.connectToWifi()
        self.initPixelController()

    def startServer(self):
        print("Starting server")

        server.run_server(self.host, self.port, self.onMsg)

    def initPixelController(self):
        print("Init PixelController")

        if __ESP__:
            pin = machine.Pin(self.ledPin, machine.Pin.OUT, machine.Pin.PULL_UP)
            self.pixelController = pixel.NeoPixel(pin, self.numberOfLeds)
        else:
            print("[No-ESP] skipped initialization of pixel controller")

    def connectToWifi(self):
        print("Connect to wifi")

        if not __ESP__:
            print("[No-ESP] skipped connecting to wifi")
            return

        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)
        if not self.wlan.isconnected():
            print('connecting to network...')
            self.wlan.connect(config.ssid, config.wifipassword)
            while not self.wlan.isconnected():
                pass
        print('network config:', self.wlan.ifconfig())
        self.host = self.wlan.ifconfig()[0]

    def getIndexFromPosition(self, pos):
        print("getIndexFromPosition", pos)
        result = 0

        # todo

        print("getIndexFromPosition", result)
        return result

    def setLed(self, pos, color):
        print('turn leds at', pos, 'to be color', color)

        index = self.getIndexFromPosition(pos)
        if __ESP__:
            self.pixelController[index] = color[0:3]
        else:
            print("[No-ESP] skipped pixel update")

    def updateLeds(self):
        print("write update to leds")

        if __ESP__:
            self.pixelController.write()
        else:
            print("[No-ESP] skipped pixel update")

    def parsePos(self, data):
        print("parsePos", data)

        result = []
        for text in data:
            result.append(int(text))

        return result

    def dispatchMessage(self, timetag, data):
        print("dispatchMessage", timetag, data)
        oscaddr, tags, args, src = data
        addrParts = oscaddr.split('/')

        if len(addrParts) > 0 and addrParts[0] == '':
            addrParts = addrParts[1:]

        if len(addrParts) > 3:
            if addrParts[0] == 'leds':
                pos = self.parsePos(addrParts[1:4])
                color = args[0]

                self.setLed(pos, color)
                self.updateLeds()

    def onMsg(self, data, src):
        print("onMsg", data, src)

        server.handle_osc(data, src, self.dispatchMessage)

if __name__ == '__main__':
    main = Main()
    main.startServer()
