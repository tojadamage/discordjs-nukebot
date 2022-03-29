@echo off 
title bot by damageDMG

if exist node_modules\ (
    echo Juz to zainstalowales
    echo Przejdz do "src/config.js" do ustawien bota i uruchom "src/start.bat"
    echo 
    pause exit
) else (
    call npm i >> NUL
    echo Pomyslnie zainstalowano moduly
    echo Uruchom ponownie plik start.bat
    pause exit
)