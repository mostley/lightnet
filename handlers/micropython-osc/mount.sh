#!/bin/bash

echo " === Mounting Nodemcu ==="

mkdir -p mount
mpfmount -p /dev/tty.SLAB_USBtoUART -b 115200 -m ./mount

echo " === done ==="
