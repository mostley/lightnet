
def clampChannel(channel):
    result = channel
    if result < 0: result = 0
    if result > 255: result = 255 
    return result

def clamp(color):
    return (
        clampChannel(color[0]),
        clampChannel(color[1]),
        clampChannel(color[2])
    )

def multiply(color, factor):
    result = (
        color[0] * factor,
        color[1] * factor,
        color[2] * factor
    )

    return clamp(result)
