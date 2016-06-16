
from linecalculator import LineCalculator
from matrixcalculator import MatrixCalculator

from hardwarepixel import HardwarePixel


class ControllerMode:
    Line = "LINE"
    Matrix = "MATRIX"
    Cube = "CUBE"


class PixelController:

    def __init__(self, dimension, mode=ControllerMode.Line):
        self.mode = mode

        if mode == ControllerMode.Line:
            self.lightCalculator = LineCalculator(dimension)
        elif mode == ControllerMode.Matrix:
            self.lightCalculator = MatrixCalculator(dimension)
        elif mode == ControllerMode.Cube:
            raise Exception("Cube calculator not yet implemented")
        else:
            raise Exception("Unknown Controller Mode", mode)

        numberOfLeds = self.lightCalculator.getNumberOfLeds()
        self.hardwarePixel = HardwarePixel(numberOfLeds)

    def setLed(self, pos, color, softness):
        print('turn leds at', pos, 'to be color', color)

        index = self.getIndexFromPosition(pos)

        lightData = self.lightCalculator.calculate(pos, color, softness)
        self.hardwarePixel.write(lightData)

    def updateLeds(self):
        print("write update to leds")

        self.hardwarePixel.flush()
