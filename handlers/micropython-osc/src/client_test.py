import client, time

address = '/leds/0/0/0'

n = 1

def sendColor(c, r, g, b):
    print("sendColor", c, r, g, b)
    msg = client.create_message(address, ('r', (r, g, b, 255)))
    c.send(msg)

c = client.Client('192.168.178.26', 2525)

for i in range(0, 4 * 256, 8):
    for j in range(n):
        if (i // 256) % 2 == 0:
            val = i & 0xff
        else:
            val = 255 - (i & 0xff)
        sendColor(c, val, 0, 0)
        time.sleep_ms(60)

sendColor(c, 0, 0, 0)

c.close()
