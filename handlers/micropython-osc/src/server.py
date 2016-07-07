# -*- coding: utf-8 -*-
#
#  server.py
#
__ESP__ = True
import socket, sys, time

try:
    import machine
except Exception as exc:
    print("Failed to hardware -> no ESP mode")
    sys.print_exception(exc)
    __ESP__ = False

from ustruct import unpack

from common import Impulse, to_time

MAX_DGRAM_SIZE = 1024
MULTICAST_INTERVAL = 3
MULTICAST_IP = '224.0.0.1'
MULTICAST_PORT = 3535
MULTICAST_PREFIX = "lightnet:"


def split_oscstr(msg, offset):
    end = msg.find(b'\0', offset)
    return msg[offset:end].decode('utf-8'), (end + 4) & ~0x03


def split_oscblob(msg, offset):
    start = offset + 4
    size = unpack('>I', msg[offset:start])[0]
    return msg[start:start+size], (start + size + 4) & ~0x03


def parse_timetag(msg, offset):
    return to_time(unpack('>II', msg[offset:offset+4]))


def parse_message(msg, strict=False):
    args = []
    addr, ofs = split_oscstr(msg, 0)

    if not addr.startswith('/'):
        raise ValueError("OSC address needs slash.")

    # type tag string must start with comma (ASCII 44)
    if ofs < len(msg) and msg[ofs] == 44:
        tags, ofs = split_oscstr(msg, ofs)
        tags = tags[1:]
    else:
        msg = "invalid OSC type tag"
        if strict:
            raise ValueError(msg)
        else:
            print('[WARN] ' + msg + ' Ignoring arguments')
            tags = ''

    for typetag in tags:
        size = 0

        if typetag in 'ifd':
            size = 8 if typetag == 'd' else 4
            args.append(unpack('>' + typetag, msg[ofs:ofs+size])[0])
        elif typetag in 'sS':
            s, ofs = split_oscstr(msg, ofs)
            args.append(s)
        elif typetag == 'b':
            s, ofs = split_oscblob(msg, ofs)
            args.append(s)
        elif typetag in 'rm':
            size = 4
            args.append(unpack('BBBB', msg[ofs:ofs+size]))
        elif typetag == 'c':
            size = 4
            args.append(chr(unpack('>I', msg[ofs:ofs+size])[0]))
        elif typetag == 'h':
            size = 8
            args.append(unpack('>q', msg[ofs:ofs+size])[0])
        elif typetag == 't':
            size = 8
            args.append(parse_timetag(msg, offset))
        elif typetag in 'TFNI':
            args.append({'T': True, 'F': False, 'I': Impulse}.get(typetag))
        else:
            raise ValueError("Type tag '%s' not supported." % typetag)

        ofs += size

    return (addr, tags, tuple(args))


def parse_bundle(bundle, strict=False):
    if not bundle.startswith(b'#bundle\0'):
        raise TypeError("Bundle must start with '#bundle\\0'.")

    ofs = 16
    timetag = to_time(*unpack('>II', bundle[8:ofs]))

    while True:
        if ofs >= len(bundle):
            break

        size = unpack('>I', bundle[ofs:ofs+4])[0]
        element = bundle[ofs+4:ofs+4+size]
        ofs += size + 4

        if element.startswith('#bundle'):
            for el in parse_bundle(element):
                yield el
        else:
            yield timetag, parse_message(element, strict)


def handle_osc(data, src, dispatch=None, strict=False):
    try:
        head, _ = split_oscstr(data, 0)

        if head.startswith('/'):
            messages = [(-1, parse_message(data, strict))]
        elif head == '#bundle':
            messages = parse_bundle(data, strict)
    except:
        #if __debug__:
            #print("[DEBUG] Could not parse message.")
            #print("[DEBUG] Data: %r", data)
        return

    try:
        for timetag, (oscaddr, tags, args) in messages:
            #if __debug__:
                #print(oscaddr)
                #print("[DEBUG] OSC address: %s" % oscaddr)
                #print("[DEBUG] OSC type tags: %r" % tags)
                #print("[DEBUG] OSC arguments: %r" % (args,))

            if dispatch:
                dispatch(timetag, (oscaddr, tags, args, src))
    except Exception as exc:
        print("[ERR] Exception in OSC handler")
        sys.print_exception(exc)

def waitForLightnetServer():
    serverIp = None

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((MULTICAST_IP, MULTICAST_PORT))
    try:
        while True:
            print("waiting for lightnet multicast")
            data, addr = s.recvfrom(100)

            if data.startswith(MULTICAST_PREFIX):
                serverIp = data.decode('utf-8')[len(MULTICAST_PREFIX):]
                break
            else:
                print("received non format message: '", data, "'")
    except KeyboardInterrupt:
        pass

    s.close()

    return serverIp

def registerClient(serverIp, clientIp, numberOfLeds):
    print("Sending Client Registration to Lightnet Server at " + serverIp)

    if not __ESP__:
        print("unable to register chip without unique id (execute on chip)")
        return

    while True:
        sock = socket.socket(socket.AF_INET)
        try:
            sock.connect((serverIp, 3636))
            sock.write('%s;%s;%s\r\n' % (clientIp, machine.unique_id().decode('utf-8'), str(numberOfLeds)))
            sock.close()
            break
        except Exception as e:
            print(e)
            sock.close()


def listenForOSC(saddr, port, handler):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setblocking(True)
    if __debug__: print("[DEBUG] Created OSC UDP server socket.", saddr, port)

    sock.bind((saddr, port))
    print("Listening for OSC messages on", saddr, port)
    try:
        while True:
            try:
                data, caddr = sock.recvfrom(MAX_DGRAM_SIZE)
            except OSError as e:
                data = None
                pass
                #sys.print_exception(e)

            if data:
                if __debug__: print("[DEBUG] RECV %i bytes", len(data))
                handler(data, caddr)
    finally:
        sock.close()

def run_server(saddr, port, numberOfLeds, handler=handle_osc):
    serverIp = waitForLightnetServer()

    if not serverIp:
        print("failed to find server")
        return

    registerClient(serverIp, saddr, numberOfLeds)

    listenForOSC(saddr, port, handler)

    print("Bye!")
