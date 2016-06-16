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
    print("[No-ESP] skipped connecting to wifi")
    return

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
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
