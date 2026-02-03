
        // ==========================================
        // MAIN CONTROL FUNCTIONS (Called from HTML)
        // ==========================================
        function startTrading() {
            const mode = document.getElementById('tradingMode').value;
            if (mode === 'backtest') {
                runBacktest();
            } else if (mode === 'paper') {
                alert('Paper Trading estará disponible próximamente');
            } else {
                alert('Trading Real requiere configuración de API Key');
            }
        }

        function stopTrading() {
            console.log('🛑 Trading detenido');
            alert('Trading detenido');
        }

        function openOptimizationModal() {
            alert('🔧 Optimización de parámetros estará disponible próximamente');
        }

        function closeOptimizationModal() {
            // Modal close logic
        }

        function resetToDefaultParams() {
            document.getElementById('fastEMA').value = '4';
            document.getElementById('slowEMA').value = '65';
            document.getElementById('biasMult').value = '1.062';
            document.getElementById('leverage').value = '10';
            document.getElementById('capital').value = '1000';
            document.getElementById('stopLossType').value = 'smart';
            document.getElementById('slMultiplier').value = '2';
            document.getElementById('takeProfitType').value = 'fixed';
            document.getElementById('takeProfit').value = '1.5';
            alert('✅ Parámetros restaurados a valores por defecto');
        }

