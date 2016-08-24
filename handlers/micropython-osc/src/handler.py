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
        self.numberOfLeds = 256

        self.hardwarePixel = HardwarePixel(self.numberOfLeds)

    def start(self):
        print("Starting server")

        server.run_server(self.host, self.port, self.numberOfLeds, self.onMsg)

    def onMsg(self, data):
        #print("onMsg", data)
        #server.handle_osc(data, self.dispatchMessage)
        self.hardwarePixel.writeDump(data)
        #self.hardwarePixel.flush()

    def dispatchMessage(self, timetag, data):
        #print("dispatchMessage", timetag, data)
        oscaddr, tags, args = data

        if oscaddr == '/l':
            #print("index", index, "color", color)
            self.hardwarePixel.write(args[0][3], args[0][0:3])
        else:
            print("unknown message address", oscaddr)
