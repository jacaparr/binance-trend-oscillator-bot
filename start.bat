@echo off
REM Script para iniciar el servidor del bot de Binance

echo.
echo ========================================
echo  Binance Trend Oscillator Bot
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en el PATH
    echo Por favor instala Python desde https://www.python.org/
    echo.
    echo Alternativa: Abre index.html directamente en tu navegador
    echo (puede tener problemas de CORS)
    pause
    exit /b 1
)

echo [INFO] Iniciando servidor local en puerto 8000...
echo [INFO] El navegador se abrira automaticamente en http://localhost:8000/index.html
echo [INFO] Presiona Ctrl+C para detener el servidor
echo.

python server.py
