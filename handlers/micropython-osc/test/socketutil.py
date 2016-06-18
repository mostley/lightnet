import socket


def pack_addr(addr):
    if isinstance(addr, (bytes, bytearray)):
        return addr

    if len(addr) != 2:
        raise NotImplementedError("Only IPv4/v6 supported")

    addrinfo = socket.getaddrinfo(addr[0], addr[1], socket.AF_INET)
    return addrinfo[0][4]
