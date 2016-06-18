__ESP__ = True

import config, time

try:
    import network, machine
except:
    print("Failed to import hardware packages, switching to no ESP mode")
    __ESP__ = False


print("===== Booting Lighnet Handler =====")
print("Connecting to wifi")

if not __ESP__:
    raise Exception("[No-ESP] skipped connecting to wifi")

def blink(led, duration):
    led.high()
    time.sleep(duration)
    led.low()
    time.sleep(duration)

def checkForFlashMode():
    if machine.Pin(0, machine.Pin.IN).value() == 0:
        wlan.active(False)
        for i in range(5):
            blink(ledPin, 0.05)
        raise Exception("Flashmode Exception: Handler is intentionally not starting.")

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

ledPin = machine.Pin(2, machine.Pin.OUT, machine.Pin.PULL_UP)
checkForFlashMode()
for i in range(2):
    blink(ledPin, 0.5)
checkForFlashMode()

if not wlan.isconnected():
    print('connecting to network (' + config.ssid + ')')
    wlan.connect(config.ssid, config.wifipassword)
    waitCounter = 0
    while not wlan.isconnected():
        waitCounter += 1
        time.sleep(1)
        if waitCounter > 10:
            print("failed to connect to wifi. Stopping execution. Please configure the correct AccessPoint.")
            wlan.active(False)
            raise Exception("Failed to connect to ssid=" + config.ssid)

print('network config:', wlan.ifconfig())
