__ESP__ = True

import time
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

        if machine.reset_cause() == machine.HARD_RESET:
            self.handler.start()
        else:
            print("handler not started on soft reset")


wlan = network.WLAN(network.STA_IF)
time.sleep(0.1)
ledPin = machine.Pin(2, machine.Pin.OUT, machine.Pin.PULL_UP)

checkForFlashMode()

wlan.active(True)
if wlan.isconnected():
    ledPin.high()
    main = Main()
    main.run()
else:
    wlan.active(False)
    ledPin.low()
