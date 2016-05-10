#!/bin/bash

echo " === copying files to ESP ==="

cd src
mpfshell -s deploy.mpf

echo " === done ==="
