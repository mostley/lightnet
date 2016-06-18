import vectormath, colormath

class PixelCalculatorBase:
    def __init__(self, dimension):
        self.dimension = dimension
        self.distanceBetweenLeds = 1.0
        self.minBrightness = 0.01
        self.handlerPosition = [0, 0, 0]

    def getNumberOfLeds(self):
        raise Exception("not implemented!")

    def getLedPos(self, index):
        raise Exception("not implemented!")

    def calculateSquareDistances(self, pos):
        result = []

        for index in range(self.getNumberOfLeds()):
            ledPos = self.getLedPos(index)
            ledPos = vectormath.add(ledPos, self.handlerPosition)
            distance = vectormath.squareDistance(pos, ledPos)
            result.append(distance)

        return result

    def calculateColor(self, color, squareDistance, softness):
        if squareDistance < 1:
            return color

        softnessFactor = softness / 255.0
        distanceFactor = 1/squareDistance * softnessFactor
        if distanceFactor > self.minBrightness:
            return colormath.multiply(color, distanceFactor)
        else:
            return None

    def calculate(self, pos, color, softness):
        result = []

        squareDistances = self.calculateSquareDistances(pos)

        for index in range(len(squareDistances)):
            squareDistance = squareDistances[index]
            
            diminishedColor = self.calculateColor(color, squareDistance, softness)
            if diminishedColor != None:
                result.append({ "index": index, "color": diminishedColor })

        return result
