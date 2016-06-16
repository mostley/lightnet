__ESP__ = True
try:
    import machine, pixel
except:
    print("Failed to import hardware packages, switching to no ESP mode")
    __ESP__ = False

class HardwarePixel:

    def __init__(self, numberOfLeds):
        self.ledPin = 4

        if __ESP__:
            pin = machine.Pin(self.ledPin, machine.Pin.OUT, machine.Pin.PULL_UP)
            self.pixels = pixel.NeoPixel(pin, numberOfLeds)
        else:
            print("[No-ESP] skipped initialization of pixel controller")

    def write(self, lightDataList):
        if __ESP__:
            for lightData in lightDataList:
                self.pixels[lightData.index] = lightData.color
        else:
            print("[No-ESP] skipped pixel update")

    def flush(self):
        if __ESP__:
            self.pixels.write()
        else:
            print("[No-ESP] skipped pixel update")
