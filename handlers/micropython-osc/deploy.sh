#!/bin/bash

echo " === copying files to ESP ==="

cd src

echo -e "open tty.SLAB_USBtoUART\n" > deploy.mpf

for file in `ls *.py`
do
  echo -e "put $file\n" >> deploy.mpf
done
echo "ls" >> deploy.mpf

mpfshell -s deploy.mpf

rm deploy.mpf

echo " === done ==="
