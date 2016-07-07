import socket

IP = "192.168.43.190"

def send_multicast():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    data = ("lightnet:"+IP).encode('utf-8')
    sock.sendto(data, ('224.0.0.1', 3535))


sock = socket.socket(socket.AF_INET)
sock.bind(("0.0.0.0", 3636))
sock.listen(1)

send_multicast()

while True:
    print("waiting for client")
    cl, addr = sock.accept()
    if not cl:
        print("no one yet, sending multicast again")
        send_multicast()
        continue
    print("client arrived")
    cl_file = cl.makefile('rwb', 0)
    while True:
        print("reading data")
        line = cl_file.readline()
        print("received", line)
        if not line or line == b'\r\n':
            break
    print("responding")
    cl.send("LDTP 200 OK")
    print("closing connection")
    cl.close()
    break
print("done")
