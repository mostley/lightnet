from pixelcalculatorbase import PixelCalculatorBase

class MatrixCalculator(PixelCalculatorBase):
    def __init__(self, dimension):
        PixelCalculatorBase.__init__(self, dimension)

        if len(self.dimension) < 2:
            raise Exception("ERROR matrix should have 2 dimension values")

    def getNumberOfLeds(self):
        return self.dimension[0] * self.dimension[1]

    def getLedPos(self, index):
        return [
            int((index % self.dimension[0]) * self.distanceBetweenLeds),
            int((index / self.dimension[0]) * self.distanceBetweenLeds),
            0
        ]
