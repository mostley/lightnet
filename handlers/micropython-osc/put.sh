#!/bin/bash

file=$1
echo " === copying $file to ESP ==="

cd src
echo -e "open tty.SLAB_USBtoUART\nput $file\nls" > deploy.mpf
mpfshell -s deploy.mpf
rm deploy.mpf

echo " === done ==="
