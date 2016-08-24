import math, esp, gc

numberOfLeds = 256
pin = machine.Pin(4, machine.Pin.OUT, machine.Pin.PULL_UP)

buf = bytearray(numberOfLeds * 3)

def sendBuf(buf):
    irq_state = machine.disable_irq()
    esp.neopixel_write(pin, buf, True)
    machine.enable_irq(irq_state)
    gc.collect()

def setColor(c):
    for i in range(numberOfLeds*3):
        buf[i] = c[i%3]

def sendColor(c):
    setColor(c)
    sendBuf(buf)
