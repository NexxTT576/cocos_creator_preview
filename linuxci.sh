#!/bin/bash
wwwgame=/home/creatorgame
if [ ! -d $wwwgame ]; then
    mkdir $wwwgame
fi
if [ ! -d "$wwwgame/game" ]; then
    mkdir "$wwwgame/game"
fi
if [  -d "$wwwgame/bin" ]; then
    rm -rf "$wwwgame/bin"
fi
if [  -d "$wwwgame/app" ]; then
    rm -rf "$wwwgame/app"
fi
cp "./bin" -rf "$wwwgame/bin"
cp "./app" -rf "$wwwgame/app"
cp "./node_modules" -rf "$wwwgame/node_modules"
cp "./creator.d.ts" -rf "$wwwgame/creator.d.ts"
cp "./package.json" -rf "$wwwgame/package.json"
cp "./linuxcibuild.sh" -rf "$wwwgame/linuxcibuild.sh"
cp "./test.js" -rf "$wwwgame/test.js"

node ./test.js $3 /$1/$2
a=$?
if test $a -eq 1
then
    echo "nodejs 异常"
    exit 1
fi
