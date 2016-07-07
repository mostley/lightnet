# RECEIVER ON PC (see http://stackoverflow.com/questions/603852/multicast-in-python)
import socket
import struct

#MCAST_GRP = '239.0.0.10'
MCAST_GRP = '224.0.0.1'
MCAST_PORT = 3535

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind((MCAST_GRP, MCAST_PORT))
mreq = struct.pack("4sl", socket.inet_aton(MCAST_GRP), socket.INADDR_ANY)
s.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

try:
    while True:
        print("waiting for data...")
        data, addr = s.recvfrom(100)
        print(data, addr)
except KeyboardInterrupt:
    pass
s.close()
print('done')
