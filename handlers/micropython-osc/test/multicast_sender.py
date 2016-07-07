import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
data = "lightnet:127.0.0.1".encode('utf-8')
sock.sendto(data, ('224.0.0.1', 3535))
