#!/bin/bash
rm -r bin/app
cp -r -f app bin/app
cp -r -f app/game/index.html bin/index.html
cp -r -f app/game/splash.png bin/splash.png
cp -r -f app/game/style-desktop.css bin/style-desktop.css
cp -r -f app/game/style-mobile.css bin/style-mobile.css
cp -r -f app/game/main.js bin/main.js
#cd bin
python -m http.server 8080 