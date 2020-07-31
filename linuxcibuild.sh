#!/bin/bash
if [ ! -d game/$1 ]; then
    mkdir game/$1
fi
if [ ! -d game/$1/$2 ]; then
    mkdir game/$1/$2
fi
node ./test.js $3 /$1/$2

rm -rf game/$1/$2/app
cp -rf app game/$1/$2/app
cp -rf app/game/index.html game/$1/$2//index.html
cp -rf app/game/splash.png game/$1/$2//splash.png
cp -rf app/game/style-desktop.css game/$1/$2//style-desktop.css
cp -rf app/game/style-mobile.css game/$1/$2//style-mobile.css
cp -rf app/game/main.js game/$1/$2//main.js

# 文件夹创建完成开始创建游戏 $3 是工程路径
node bin/creatorweb.js $3/assets game/$1/$2
a=$?
if test $a -eq 1
then
    echo "nodejs 异常"
    exit 1
fi