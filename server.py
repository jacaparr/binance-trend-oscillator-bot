#!/usr/bin/env python3
"""
Servidor HTTP simple para el bot de Binance
Evita problemas de CORS al acceder a la API de Binance
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers para permitir CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Redirigir favicon.ico a favicon.svg si existe
        if self.path == '/favicon.ico' and os.path.exists('favicon.svg'):
            self.path = '/favicon.svg'
        return super().do_GET()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"")
        print(f"🚀 Servidor iniciado en el puerto {PORT}")
        print(f"📊 Abre tu navegador en: {url}")
        print(f"⏹️  Presiona Ctrl+C para detener el servidor")
        print(f"")
        
        # Abrir automáticamente el navegador
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor detenido")

if __name__ == "__main__":
    main()
