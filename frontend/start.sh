#!/bin/sh
exec http-server build -p ${PORT:-3000}
