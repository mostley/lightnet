import client, time, math
from common import Bundle

IP = "192.168.43.63"
n = 1

def createBundle(data):
    bundleData = []
    for i in range(0, 21):
        bundleData.append(('/led', ('i', i), ('r', data[i])))
    return Bundle(*bundleData)

def sendColor(c, index, r, g, b):
    address = '/led'
    print("sendColor", c, index, r, g, b)
    msg = client.create_message(address, ('i', index), ('r', (r, g, b, 255)))
    c.send(msg)

def sendBundle(c, bundle):
    address = '/leds'
    print("sendBundle")
    c.send(bundle)

def wheel(wheelPos):
  wheelPos = 255 - wheelPos;
  if wheelPos < 85:
    return (255 - wheelPos * 3, 0, wheelPos * 3)

  if wheelPos < 170:
    wheelPos -= 85;
    return (0, wheelPos * 3, 255 - wheelPos * 3)

  wheelPos -= 170;
  return (wheelPos * 3, 255 - wheelPos * 3, 0)


c = client.Client(IP, 2525)

bundles = []
for n in range(0, 256):
    bundleData = createBundle([wheel(i+n) for i in range(21)])
    bundles.append(Bundle(*bundleData))

for bundle in bundles:
    sendBundle(c, bundle)
    time.sleep_ms(60)


sendBundle(c, createBundle([(0,0,0) for i in range(21)]))

c.close()
