import time, math, socket, os, ustruct

IP = "192.168.178.28"
numberOfLeds = 255
shelfCount = 60
bottlesPerShelf = 7
bottleCount = bottlesPerShelf*3
ledsPerShelf = 20
ledsPerBottle = int(math.ceil(ledsPerShelf/bottlesPerShelf))
bottleLedMargin = 0

bottles = []
for b in range(bottleCount):
    start = b*ledsPerBottle - bottleLedMargin
    start = start if start >= 0 else 0
    end = start + ledsPerBottle + bottleLedMargin*2
    bottles.append(range(start, end))


def randomByte():
    return ustruct.unpack('<H', os.urandom(1))[0]

def shuffle(items):
    for i in reversed(range(1, len(items))):
        # pick an element in x[:i+1] with which to exchange x[i]
        j = int(randomByte()/255.0 * (i+1))
        items[i], items[j] = items[j], items[i]

shuffledBottleIndexes = list(range(0, bottleCount))
shuffle(shuffledBottleIndexes)

def wheel(wheelPos):
  wheelPos = 255 - wheelPos;
  if wheelPos < 85:
    return (255 - wheelPos * 3, 0, wheelPos * 3)

  if wheelPos < 170:
    wheelPos -= 85;
    return (0, wheelPos * 3, 255 - wheelPos * 3)

  wheelPos -= 170;
  return (wheelPos * 3, 255 - wheelPos * 3, 0)

def createBlobMessage(data):
    grbData = [(g, r, b) for (r,g,b) in data]
    return bytearray([channel for color in grbData for channel in color])

def wheelData(n):
    return [wheel((i+n) % 255) for i in range(numberOfLeds)]

def multiplyColor(c, factor):
    return (
        int((c[0] * factor) % 255),
        int((c[1] * factor) % 255),
        int((c[2] * factor) % 255)
    )

def clamp(c, minValue, maxValue):
    return min(maxValue, max(minValue, c))

def clampColor(c):
    return (
        int(clamp(c[0], 0, 255)),
        int(clamp(c[1], 0, 255)),
        int(clamp(c[2], 0, 255))
    )

def cutoffColor(c):
    return (
        c[0] if c[0] > 10 else 0,
        c[1] if c[1] > 10 else 0,
        c[2] if c[2] > 10 else 0,
    )


def runningEye(n):
    return [(255,255,255) if abs(i-n) < 5 else (0,0,0) for i in range(numberOfLeds)]

def smoothRunningEye(n):
    return [multiplyColor((255,255,255), 1/(abs(i-n)+0.001)) for i in range(numberOfLeds)]

def colorSin(n):
    return (math.sin(n) + 1)/2*255

def whopwhop(n):
    t = 0.0001
    if n < math.pi*20:
        return [clampColor((colorSin(n/1.0),0,0)) for i in range(numberOfLeds)]
    elif n < math.pi*40:
        return [clampColor((0, colorSin(n/10.0),0)) for i in range(numberOfLeds)]
    elif n < math.pi*60:
        return [clampColor((0,0,colorSin(n*2.0))) for i in range(numberOfLeds)]
    else:
        return [clampColor((colorSin(n/100.0),colorSin(n/1.0),colorSin(n/1.0))) for i in range(numberOfLeds)]

def isBottle(bottles, led, bottleIndex):
    if bottleIndex >= len(bottles):
        return False
    #print(led,bottleIndex, led in bottles[bottleIndex])
    return led in bottles[bottleIndex]

def bottlegame(n):
    result = []

    slowCount = int((n/10)%bottleCount)

    for i in range(numberOfLeds):
        if isBottle(bottles, i, shuffledBottleIndexes[slowCount]):
            result.append((255,255,255))
        elif i < shelfCount:
            result.append((0,0,0))
        else:
            result.append((255,0,0))

    return result


sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

n = 0
while True:
    #msg = createBlobMessage(wheelData(n))
    #msg = createBlobMessage(runningEye(n))
    #msg = createBlobMessage(smoothRunningEye(n))
    msg = createBlobMessage([(255,255,255) for i in range(numberOfLeds)])
    #msg = createBlobMessage([(255,255,0) for i in range(numberOfLeds)])
    #msg = createBlobMessage(whopwhop(n))
    #msg = createBlobMessage(bottlegame(n))

    sock.sendto(msg, socket.getaddrinfo(IP, 2525, socket.AF_INET)[0][4])
    time.sleep_ms(100)

    n += 1
    break

sock.close()
