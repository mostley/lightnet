__ESP__ = True

from handler import Handler

try:
    import machine, network
except:
    print("Failed to import hardware packages, switching to no ESP mode")
    __ESP__ = False

class Main:
    def __init__(self):
        self.handler = Handler()


    def run(self):
        print("Running (after " + str(machine.reset_cause()) + ")")

        if machine.reset_cause() == machine.PWR_ON_RESET:
            self.handler.start()
        else:
            print("handler not started on soft reset")

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
if wlan.isconnected():
    main = Main()
    main.run()
else:
    wlan.active(False)
