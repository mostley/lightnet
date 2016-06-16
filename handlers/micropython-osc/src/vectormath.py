
def squareDistance(pos1, pos2):
    x = pos2[0] - pos1[0]
    y = pos2[1] - pos1[1]
    z = pos2[2] - pos1[2]

    return math.pow(x, 2) + math.pow(y, 2) + math.pow(z, 2)

def distance(pos1, pos2):
    return math.sqrt(math.pow(x, 2) + math.pow(y, 2) + math.pow(z, 2))
