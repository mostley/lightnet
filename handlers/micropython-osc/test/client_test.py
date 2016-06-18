import client, time


n = 1

def sendColor(c, index, r, g, b):
    address = '/led/' + str(index)
    print("sendColor", c, index, r, g, b)
    msg = client.create_message(address, ('r', (r, g, b, 255)))
    c.send(msg)

c = client.Client('192.168.178.26', 2525)

# for i in range(0, 4 * 256, 8):
#     for j in range(n):
#         if (i // 256) % 2 == 0:
#             val = i & 0xff
#         else:
#             val = 255 - (i & 0xff)
#         sendColor(c, 0, val, 0, 0)
#         time.sleep_ms(60)

for n in range(0, 4):
    for i in range(0, 22):
        if i > 0:
            sendColor(c, i-1, 0, 0, 0)
        sendColor(c, i, 255, 0, 0)
        time.sleep_ms(60)

for i in range(0, 22):
    sendColor(c, i, 0, 0, 0)

c.close()
