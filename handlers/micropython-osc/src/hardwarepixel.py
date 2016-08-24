__ESP__ = True
import sys

try:
    import machine, esp, gc
    from neopixel import NeoPixel
except Exception as exc:
    print("Failed to import hardware packages, switching to no ESP mode")
    sys.print_exception(exc)
    __ESP__ = False

class HardwarePixel:

    def __init__(self, numberOfLeds):
        self.ledPin = 4

        if __ESP__:
            self.pin = machine.Pin(self.ledPin, machine.Pin.OUT, machine.Pin.PULL_UP)
            #self.pixels = NeoPixel(self.pin, numberOfLeds)
        else:
            print("[No-ESP] skipped initialization of pixel controller")

    def writeDump(self, data):
        if __ESP__:
            irq_state = machine.disable_irq()
            esp.neopixel_write(self.pin, data, True)
            machine.enable_irq(irq_state)
            gc.collect()
        else:
            print("[No-ESP] skipped pixel update")

    def write(self, index, color):
        if __ESP__:
            #self.pixels[index] = color
            pass
        else:
            print("[No-ESP] skipped pixel update")

    def flush(self):
        if __ESP__:
            #self.pixels.write()
            pass
        else:
            print("[No-ESP] skipped pixel update")
