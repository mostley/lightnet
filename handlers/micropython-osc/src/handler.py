import server
from pixelcontroller import PixelController, ControllerMode

class Handler:
    def __init__(self):
        self.pixelController = None
        self.host = '127.0.0.1'
        self.port = 2525

        self.pixelController = PixelController([1], ControllerMode.Line)

    def start(self):
        print("Starting server")

        server.run_server(self.host, self.port, self.onMsg)

    def onMsg(self, data, src):
        print("onMsg", data, src)

        server.handle_osc(data, src, self.dispatchMessage)

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

                self.pixelController.setLed(pos, color)
                self.pixelController.updateLeds()
