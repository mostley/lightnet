import socket
from ustruct import pack

MAX_DGRAM_SIZE = 1024


UPNP_MCAST_IP = "239.0.0.10"
#UPNP_MCAST_IP = "224.0.0.1"

UPNP_PORT = 2525
BIND_IP = "0.0.0.0"

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

#addr = socket.getaddrinfo(BIND_IP, UPNP_PORT, socket.AF_INET, socket.SOCK_DGRAM)[0][4]
#sock.bind(addr)
sock.bind((BIND_IP, 2525))
#sock.bind((UPNP_MCAST_IP, UPNP_PORT))

mreq = socket.inet_aton(UPNP_MCAST_IP) + socket.inet_aton(BIND_IP)
#mreq = pack("4sl", socket.inet_aton(UPNP_MCAST_IP), socket.inet_aton(BIND_IP))
sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

print("listening for messages...")
try:
    while True:
        data, caddr = sock.recv(MAX_DGRAM_SIZE)
        print("[DEBUG] RECV %i bytes", len(data), caddr)
finally:
    sock.close()
    print("done. Bye!")
