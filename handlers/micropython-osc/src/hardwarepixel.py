__ESP__ = True
import sys

try:
    import machine
    from neopixel import NeoPixel
except Exception as exc:
    print("Failed to import hardware packages, switching to no ESP mode")
    sys.print_exception(exc)
    __ESP__ = False

class HardwarePixel:

    def __init__(self, numberOfLeds):
        self.ledPin = 4

        if __ESP__:
            pin = machine.Pin(self.ledPin, machine.Pin.OUT, machine.Pin.PULL_UP)
            self.pixels = NeoPixel(pin, numberOfLeds)
        else:
            print("[No-ESP] skipped initialization of pixel controller")

    def write(self, index, color):
        if __ESP__:
            self.pixels[index] = color
        else:
            print("[No-ESP] skipped pixel update")

    def flush(self):
        if __ESP__:
            self.pixels.write()
        else:
            print("[No-ESP] skipped pixel update")
