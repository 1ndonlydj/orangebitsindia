#!/bin/sh
BUILDAT=`date +%m%d%Y%H%M%S`
echo $BUILDAT
sed -i -e 's/__build_at__/"'$BUILDAT'"/g' index.js
