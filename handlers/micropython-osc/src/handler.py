import server, sys
from hardwarepixel import HardwarePixel
__ESP__ = True

try:
    import network
except Exception as exc:
    print("Failed to import hardware packages, switching to no ESP mode")
    sys.print_exception(exc)
    __ESP__ = False

class Handler:
    def __init__(self):
        if __ESP__:
            self.host = network.WLAN(network.STA_IF).ifconfig()[0]
        else:
            self.host = '127.0.0.1'
        self.port = 2525

        self.hardwarePixel = HardwarePixel(21)

    def start(self):
        print("Starting server")

        server.run_server(self.host, self.port, self.onMsg)

    def onMsg(self, data, src):
        server.handle_osc(data, src, self.dispatchMessage)
        self.hardwarePixel.flush()

    def parsePos(self, data):
        result = []
        for text in data:
            result.append(int(text))

        return result

    def dispatchMessage(self, timetag, data):
        #print("dispatchMessage", timetag, data)
        oscaddr, tags, args, src = data
        addrParts = oscaddr.split('/')

        if len(addrParts) > 0 and addrParts[0] == '':
            addrParts = addrParts[1:]

        if addrParts[0] == 'led':
            index = args[0]
            color = args[1][0:3]
            #print("index", index, "color", color)
            self.hardwarePixel.write(index, color)
        else:
            print("unknown message address", oscaddr)
