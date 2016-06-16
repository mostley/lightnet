from pixelcalculatorbase import PixelCalculatorBase

class LineCalculator(PixelCalculatorBase):
    def __init__(self, dimension):
        PixelCalculatorBase.__init__(self, dimension)

    def getNumberOfLeds(self):
        return self.dimension[0]

    def getLedPos(self, index):
        return [ int(index * self.distanceBetweenLeds), 0, 0 ]
