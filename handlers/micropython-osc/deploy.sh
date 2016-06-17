#!/bin/bash

echo " === copying files to ESP ==="

cd src
echo -e "open tty.SLAB_USBtoUART\nmput .*\.py$\nls" > deploy.mpf
mpfshell -s deploy.mpf

rm deploy.mpf

echo " === done ==="
