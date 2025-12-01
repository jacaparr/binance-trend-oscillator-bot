
        // Variables globales declaradas inmediatamente
        let priceChart;
        let tradingInterval = null;
        let isTrading = false;
        let paperTradingData = {
            balance: 1000,
            position: null,
            trades: [],
            prices: [],
            times: [],
            oscillator: []
        };
        
        console.log('âœ… Script iniciado - esperando DOM...');
        
        // Esperar a que el DOM estÃ© completamente cargado
        document.addEventListener('DOMContentLoaded', function() {
            console.log('ðŸš€ DOM cargado - inicializando aplicaciÃ³n...');

        // Lista de activos para multi-asset trading
        const TOP_15_ASSETS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
            'DOGEUSDT', 'SOLUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT',
            'AVAXUSDT', 'MATICUSDT', 'UNIUSDT', 'FTMUSDT', 'ATOMUSDT'];

        const ALL_ASSETS = [...TOP_15_ASSETS, 'TRXUSDT', 'ETCUSDT', 'XLMUSDT', 'VETUSDT',
            'ICPUSDT', 'FILUSDT', 'NEARUSDT', 'ALGOUSDT', 'APTUSDT', 'ARBUSDT',
            'OPUSDT', 'INJUSDT', 'LDOUSDT', 'STXUSDT', 'SEIUSDT', 'SUIUSDT'];

        let multiAssetData = {};

        // Nombres completos de las criptomonedas
        const CRYPTO_NAMES = {
            'BTCUSDT': 'ðŸ“Š Bitcoin (BTC)',
            'ETHUSDT': 'ðŸ“Š Ethereum (ETH)',
            'BNBUSDT': 'ðŸ“Š Binance Coin (BNB)',
            'XRPUSDT': 'ðŸ“Š Ripple (XRP)',
            'ADAUSDT': 'ðŸ“Š Cardano (ADA)',
            'DOGEUSDT': 'ðŸ“Š Dogecoin (DOGE)',
            'SOLUSDT': 'ðŸ“Š Solana (SOL)',
            'DOTUSDT': 'ðŸ“Š Polkadot (DOT)',
            'LINKUSDT': 'ðŸ“Š Chainlink (LINK)',
            'LTCUSDT': 'ðŸ“Š Litecoin (LTC)',
            'AVAXUSDT': 'ðŸ“Š Avalanche (AVAX)',
            'MATICUSDT': 'ðŸ“Š Polygon (MATIC)',
            'UNIUSDT': 'ðŸ“Š Uniswap (UNI)',
            'FTMUSDT': 'ðŸ“Š Fantom (FTM)',
            'ATOMUSDT': 'ðŸ“Š Cosmos (ATOM)',
            'TRXUSDT': 'ðŸ“Š Tron (TRX)',
            'ETCUSDT': 'ðŸ“Š Ethereum Classic (ETC)',
            'XLMUSDT': 'ðŸ“Š Stellar (XLM)',
            'VETUSDT': 'ðŸ“Š VeChain (VET)',
            'ICPUSDT': 'ðŸ“Š Internet Computer (ICP)',
            'FILUSDT': 'ðŸ“Š Filecoin (FIL)',
            'NEARUSDT': 'ðŸ“Š NEAR Protocol (NEAR)',
            'ALGOUSDT': 'ðŸ“Š Algorand (ALGO)',
            'APTUSDT': 'ðŸ“Š Aptos (APT)',
            'ARBUSDT': 'ðŸ“Š Arbitrum (ARB)',
            'OPUSDT': 'ðŸ“Š Optimism (OP)',
            'INJUSDT': 'ðŸ“Š Injective (INJ)',
            'LDOUSDT': 'ðŸ“Š Lido DAO (LDO)',
            'STXUSDT': 'ðŸ“Š Stacks (STX)',
            'SEIUSDT': 'ðŸ“Š Sei (SEI)',
            'SUIUSDT': 'ðŸ“Š Sui (SUI)'
        };

    function getDateRangeText() {
        const dateRange = document.getElementById('dateRange').value;

        if (dateRange === 'all') {
        return '';
        }

        if (dateRange === 'custom') {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            const start = new Date(startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            const end = new Date(endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            return ` (${start} - ${end})`;
        }
        return '';
        }

        const rangeLabels = {
        '1m': 'Ãšltimo mes',
        '3m': 'Ãšltimos 3 meses',
        '6m': 'Ãšltimos 6 meses',
        '1y': 'Ãšltimo aÃ±o',
        '2y': 'Ãšltimos 2 aÃ±os'
        };

        return ` (${rangeLabels[dateRange]})`;
        }

    function updateChartSymbolTitle(symbol) {
        const titleElement = document.getElementById('chartSymbolTitle');
        if (titleElement) {
        const cryptoName = CRYPTO_NAMES[symbol] || `ðŸ“Š ${symbol.replace('USDT', '')}`;
        const dateRange = getDateRangeText();
        titleElement.textContent = cryptoName + dateRange;
        }
        }

        // Mostrar/ocultar info de multi-timeframe y multi-asset
        // Los listeners se ejecutan al cargar el script (estÃ¡ al final del body)
        const multiTFSelect = document.getElementById('multiTimeframe');
        if (multiTFSelect) {
        multiTFSelect.addEventListener('change', function () {
            const infoDiv = document.getElementById('multiTFInfo');
            if (this.value === 'enabled') {
                infoDiv.style.display = 'block';
            } else {
                infoDiv.style.display = 'none';
            }
        });
        }

        const multiAssetSelect = document.getElementById('multiAsset');
        if (multiAssetSelect) {
        multiAssetSelect.addEventListener('change', function () {
            const infoDiv = document.getElementById('multiAssetInfo');
            if (this.value !== 'single') {
                infoDiv.style.display = 'block';
            } else {
                infoDiv.style.display = 'none';
            }
        });
        }

        // Actualizar tÃ­tulo cuando cambie el sÃ­mbolo
        const symbolSelect = document.getElementById('symbol');
        if (symbolSelect) {
        symbolSelect.addEventListener('change', function () {
            updateChartSymbolTitle(this.value);

            // Si hay un backtest activo o grÃ¡ficos mostrados, re-ejecutar automÃ¡ticamente
            const statsVisible = document.getElementById('stats').style.display !== 'none';
            const mode = document.getElementById('tradingMode').value;

            if (statsVisible && mode === 'backtest') {
                console.log(`ðŸ”„ SÃ­mbolo cambiado a ${this.value} - Re-ejecutando backtest...`);
                runBacktest();
            } else if (isTrading && mode === 'paper') {
                console.log(`ðŸ”„ SÃ­mbolo cambiado a ${this.value} - Reiniciando paper trading...`);
                stopTrading();
                setTimeout(() => startPaperTrading(), 500);
            }
        });
        }

        // TambiÃ©n agregar listener para timeframe
        const timeframeSelect = document.getElementById('timeframe');
        if (timeframeSelect) {
        timeframeSelect.addEventListener('change', function () {
            const statsVisible = document.getElementById('stats').style.display !== 'none';
            const mode = document.getElementById('tradingMode').value;

            if (statsVisible && mode === 'backtest') {
                console.log(`ðŸ”„ Timeframe cambiado a ${this.value} - Re-ejecutando backtest...`);
                runBacktest();
            } else if (isTrading && mode === 'paper') {
                console.log(`ðŸ”„ Timeframe cambiado a ${this.value} - Reiniciando paper trading...`);
                stopTrading();
                setTimeout(() => startPaperTrading(), 500);
            }
        });
        }

        // Listener para cambiar tipo de Stop Loss
        const stopLossTypeSelect = document.getElementById('stopLossType');
        if (stopLossTypeSelect) {
        stopLossTypeSelect.addEventListener('change', function () {
            const slMultiplierGroup = document.getElementById('slMultiplierGroup');
            const slFixedGroup = document.getElementById('slFixedGroup');

            if (this.value === 'smart') {
                // Establecer fechas por defecto
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 6); // 6 meses atrÃ¡s por defecto

                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];

                dateRangeSelect.addEventListener('change', function () {
                    const customDateStart = document.getElementById('customDateStart');
                    const customDateEnd = document.getElementById('customDateEnd');

                    if (this.value === 'custom') {
                        if (customDateStart) customDateStart.style.display = 'flex';
                        if (customDateEnd) customDateEnd.style.display = 'flex';
                    } else {
                        if (customDateStart) customDateStart.style.display = 'none';
                        if (customDateEnd) customDateEnd.style.display = 'none';
                    }

                    // Re-ejecutar backtest si ya hay uno activo
                    const statsVisible = document.getElementById('stats').style.display !== 'none';
                    const mode = document.getElementById('tradingMode').value;

                    if (statsVisible && mode === 'backtest') {
                        console.log(`ðŸ”„ Rango de fechas cambiado - Re-ejecutando backtest...`);
                        runBacktest();
                    }
                });
            }
        }

    async function fetchBinanceData(symbol, interval, limit = 500) {
        try {
        // Calcular fechas segÃºn el rango seleccionado
        const dateRange = document.getElementById('dateRange').value;
        let startTime = null;
        let endTime = Date.now();

                if (dateRange !== 'all') {
                    if (dateRange === 'custom') {
                        const startDateInput = document.getElementById('startDate').value;
                        const endDateInput = document.getElementById('endDate').value;

                        if (startDateInput && endDateInput) {
                            startTime = new Date(startDateInput).getTime();
                            endTime = new Date(endDateInput).getTime();
                            endTime = endTime + (24 * 60 * 60 * 1000) - 1; // Fin del dÃ­a
                        }
                    } else {
                        // Rangos predefinidos
                        const now = new Date();

                        switch (dateRange) {
                            case '1m':
                                now.setMonth(now.getMonth() - 1);
                                break;
                            case '3m':
                                now.setMonth(now.getMonth() - 3);
                                break;
                            case '6m':
                                now.setMonth(now.getMonth() - 6);
                                break;
                            case '1y':
                                now.setFullYear(now.getFullYear() - 1);
                                break;
                            case '2y':
                                now.setFullYear(now.getFullYear() - 2);
                                break;
                        }
                        startTime = now.getTime();
                    }
                }

                // Intentar con la API pÃºblica de Binance
                let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

                if (startTime) {
                    url += `&startTime=${startTime}&endTime=${endTime}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (!data || data.length === 0) {
                    throw new Error('No se recibieron datos de Binance');
                }

                return data.map(candle => ({
                    time: new Date(candle[0]),
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4])
                }));
            } catch (error) {
                console.error('Error en fetchBinanceData:', error);

                // Si hay error CORS, informar al usuario
                if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                    throw new Error('Error de CORS. Por favor, sirve el archivo con un servidor local (ver README)');
                }

                throw error;
            }
        }

    function calculateEMA(data, period) {
            const k = 2 / (period + 1);
            let ema = [data[0]];
            for (let i = 1; i < data.length; i++) {
                ema.push(data[i] * k + ema[i - 1] * (1 - k));
            }
            return ema;
        }

    function calculateOscillator(prices, fastLen, slowLen, bias) {
            const fastEMA = calculateEMA(prices, fastLen);
            const slowEMA = calculateEMA(prices, slowLen);
            return fastEMA.map((fast, i) => (fast - slowEMA[i]) * bias);
        }

    function calculateATR(data, period = 14) {
            // ATR (Average True Range) - Mide la volatilidad del mercado
            const tr = [];

            for (let i = 1; i < data.length; i++) {
                const high = data[i].high;
                const low = data[i].low;
                const prevClose = data[i - 1].close;

                // True Range es el mayor de:
                // 1. High - Low
                // 2. |High - Previous Close|
                // 3. |Low - Previous Close|
                const trueRange = Math.max(
                    high - low,
                    Math.abs(high - prevClose),
                    Math.abs(low - prevClose)
                );

                tr.push(trueRange);
            }

            // Calcular ATR como promedio mÃ³vil del True Range
            const atr = [];
            let sum = 0;

            for (let i = 0; i < tr.length; i++) {
                if (i < period - 1) {
                    sum += tr[i];
                    atr.push(0);
                } else if (i === period - 1) {
                    sum += tr[i];
                    atr.push(sum / period);
                } else {
                    // ATR suavizado: (ATR anterior * (period-1) + TR actual) / period
                    const newATR = (atr[i - 1] * (period - 1) + tr[i]) / period;
                    atr.push(newATR);
                }
            }

            return atr;
        }

    async function getHigherTimeframeSignal(symbol, currentTimeframe, fastLen, slowLen, bias) {
        // Determinar el timeframe superior
        const higherTimeframe = currentTimeframe === '4h' ? '1d' : '1w';

        try {
        // Obtener datos del timeframe superior
        const data = await fetchBinanceData(symbol, higherTimeframe, 100);
        const prices = data.map(d => d.close);
        const oscillator = calculateOscillator(prices, fastLen, slowLen, bias);

        // Obtener el Ãºltimo valor del oscilador
        const currentOsc = oscillator[oscillator.length - 1];

        return {
            timeframe: higherTimeframe,
            oscillator: currentOsc,
            trend: currentOsc >= 0 ? 'ALCISTA' : 'BAJISTA'
        };
        } catch (error) {
        console.error('Error obteniendo timeframe superior:', error);
        return null;
        }
        }

    async function startTrading() {
        console.log('ðŸš€ startTrading() llamada');
        const mode = document.getElementById('tradingMode').value;
        console.log(`ðŸ“Š Modo seleccionado: ${mode}`);

        if (mode === 'backtest') {
        await runBacktest();
        } else if (mode === 'paper') {
        await startPaperTrading();
        } else if (mode === 'live') {
        alert('Trading real estarÃ¡ disponible prÃ³ximamente. Requiere API Key de Binance.');
        }
        }

    function stopTrading() {
        if (tradingInterval) {
        clearInterval(tradingInterval);
        tradingInterval = null;
        }
        isTrading = false;
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('stopBtn').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
        console.log('ðŸ›‘ Trading detenido');
        }

    async function runBacktest() {
        console.log('ðŸ“Š Iniciando runBacktest()...');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('stats').style.display = 'none';
        document.getElementById('priceChartContainer').style.display = 'none';
        document.getElementById('tradesTableContainer').style.display = 'none';

            const symbol = document.getElementById('symbol').value;
            const timeframe = document.getElementById('timeframe').value;
            const leverage = parseInt(document.getElementById('leverage').value);
            const initialCapital = parseFloat(document.getElementById('capital').value);
            const fastLen = parseInt(document.getElementById('fastEMA').value);
            const slowLen = parseInt(document.getElementById('slowEMA').value);
            const bias = parseFloat(document.getElementById('biasMult').value);
            const stopLossType = document.getElementById('stopLossType').value;
            const slMultiplier = parseFloat(document.getElementById('slMultiplier').value);
            const stopLossPercent = parseFloat(document.getElementById('stopLoss').value);
            const takeProfitPercent = parseFloat(document.getElementById('takeProfit').value);

            try {
                const data = await fetchBinanceData(symbol, timeframe);
                const prices = data.map(d => d.close);
                const times = data.map(d => d.time);
                // Guardar OHLC para velas japonesas
                paperTradingData.opens = data.map(d => d.open);
                paperTradingData.highs = data.map(d => d.high);
                paperTradingData.lows = data.map(d => d.low);
                paperTradingData.closes = prices;
                const oscillator = calculateOscillator(prices, fastLen, slowLen, bias);

                // Calcular ATR si el Stop Loss es inteligente
                let atrValues = [];
                if (stopLossType === 'smart') {
                    atrValues = calculateATR(data, 14);
                    console.log(`ðŸ§  Stop Loss Inteligente activado - ATR multiplicador: ${slMultiplier}x`);
                }

                let balance = initialCapital;
                let position = null;
                const trades = [];
                const balanceHistory = [initialCapital];
                let wins = 0;
                const commission = 0.0004; // 0.04% Binance Futures fee

                // Contador de seÃ±ales para debug
                let longSignals = 0;
                let shortSignals = 0;
                let filteredSignals = 0;

                // Obtener seÃ±al del timeframe superior si estÃ¡ activado
                const multiTF = document.getElementById('multiTimeframe').value;
                let higherTFSignal = null;

                if (multiTF === 'enabled') {
                    higherTFSignal = await getHigherTimeframeSignal(symbol, timeframe, fastLen, slowLen, bias);
                    if (higherTFSignal) {
                        console.log(`ðŸ“ˆ Tendencia ${higherTFSignal.timeframe.toUpperCase()}: ${higherTFSignal.trend} (Osc: ${higherTFSignal.oscillator.toFixed(4)})`);
                    }
                }

                for (let i = 1; i < oscillator.length; i++) {
                    const prevOsc = oscillator[i - 1];
                    const currOsc = oscillator[i];

                    // Abrir posiciÃ³n LONG
                    if (!position && currOsc >= 0 && prevOsc < 0) {
                        longSignals++;

                        // Verificar confirmaciÃ³n del timeframe superior
                        let confirmed = true;
                        if (multiTF === 'enabled' && higherTFSignal) {
                            confirmed = higherTFSignal.trend === 'ALCISTA';
                            if (!confirmed) {
                                filteredSignals++;
                                console.log(`ðŸš« SeÃ±al LONG filtrada - Tendencia ${higherTFSignal.timeframe} es BAJISTA`);
                            }
                        }

                        if (confirmed) {
                            position = {
                                type: 'LONG',
                                entry: prices[i],
                                entryTime: times[i],
                                leverage: leverage
                            };
                        }
                    }
                    // Abrir posiciÃ³n SHORT
                    else if (!position && currOsc < 0 && prevOsc >= 0) {
                        shortSignals++;

                        // Verificar confirmaciÃ³n del timeframe superior
                        let confirmed = true;
                        if (multiTF === 'enabled' && higherTFSignal) {
                            confirmed = higherTFSignal.trend === 'BAJISTA';
                            if (!confirmed) {
                                filteredSignals++;
                                console.log(`ðŸš« SeÃ±al SHORT filtrada - Tendencia ${higherTFSignal.timeframe} es ALCISTA`);
                            }
                        }

                        if (confirmed) {
                            position = {
                                type: 'SHORT',
                                entry: prices[i],
                                entryTime: times[i],
                                leverage: leverage
                            };
                        }
                    }
                    // Verificar Stop Loss y Take Profit si hay posiciÃ³n abierta
                    if (position) {
                        let shouldClose = false;
                        let exitReason = 'Signal';

                        // Calcular P&L actual en porcentaje (sin apalancamiento para comparar con SL/TP)
                        const priceChangePercent = position.type === 'LONG'
                            ? ((prices[i] - position.entry) / position.entry) * 100
                            : ((position.entry - prices[i]) / position.entry) * 100;

                        // Verificar Stop Loss
                        if (stopLossType === 'smart' && atrValues[i] > 0) {
                            // Stop Loss Inteligente basado en ATR
                            const atrDistance = (atrValues[i] / position.entry) * 100 * slMultiplier;

                            if (priceChangePercent <= -atrDistance) {
                                shouldClose = true;
                                exitReason = `ðŸ§  SL Inteligente (${atrDistance.toFixed(2)}%)`;
                            }
                        } else if (stopLossType === 'fixed' && stopLossPercent > 0 && priceChangePercent <= -stopLossPercent) {
                            shouldClose = true;
                            exitReason = 'ðŸ›‘ Stop Loss';
                        }
                        // Verificar Take Profit
                        else if (takeProfitPercent > 0 && priceChangePercent >= takeProfitPercent) {
                            shouldClose = true;
                            exitReason = 'ðŸŽ¯ Take Profit';
                        }
                        // Verificar seÃ±al de salida por oscilador
                        else if (position.type === 'LONG' && currOsc < 0 && prevOsc >= 0) {
                            shouldClose = true;
                            exitReason = 'ðŸ“‰ SeÃ±al';
                        }
                        else if (position.type === 'SHORT' && currOsc >= 0 && prevOsc < 0) {
                            shouldClose = true;
                            exitReason = 'ðŸ“ˆ SeÃ±al';
                        }

                        // Cerrar posiciÃ³n si se cumple alguna condiciÃ³n
                        if (shouldClose) {
                            const priceChange = position.type === 'LONG'
                                ? (prices[i] - position.entry) / position.entry
                                : (position.entry - prices[i]) / position.entry;

                            const leveragedReturn = priceChange * position.leverage;
                            const commissionCost = commission * 2; // Entry + Exit
                            const netReturn = leveragedReturn - commissionCost;
                            const profitLoss = balance * netReturn;

                            balance += profitLoss;
                            if (profitLoss > 0) wins++;

                            trades.push({
                                type: position.type,
                                entry: position.entry,
                                exit: prices[i],
                                entryTime: position.entryTime,
                                exitTime: times[i],
                                leverage: position.leverage,
                                profit: profitLoss,
                                balance: balance,
                                exitReason: exitReason
                            });

                            position = null;
                        }
                    }

                    balanceHistory.push(balance);
                }

                // Log de debug
                console.log(`SeÃ±ales LONG detectadas: ${longSignals}`);
                console.log(`SeÃ±ales SHORT detectadas: ${shortSignals}`);
                if (multiTF === 'enabled') {
                    console.log(`SeÃ±ales filtradas por multi-timeframe: ${filteredSignals}`);
                    console.log(`Tasa de filtrado: ${((filteredSignals / (longSignals + shortSignals)) * 100).toFixed(1)}%`);
                }
                console.log(`Total de trades ejecutados: ${trades.length}`);
                console.log(`Rango del oscilador: ${Math.min(...oscillator).toFixed(2)} a ${Math.max(...oscillator).toFixed(2)}`);

                // Calcular mÃ©tricas
                const finalCapital = balance;
                const totalProfit = finalCapital - initialCapital;
                const roi = ((finalCapital - initialCapital) / initialCapital) * 100;
                const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

                // Calcular drawdown mÃ¡ximo
                let maxDrawdown = 0;
                let peak = balanceHistory[0];
                for (let bal of balanceHistory) {
                    if (bal > peak) peak = bal;
                    const drawdown = ((peak - bal) / peak) * 100;
                    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
                }

                // Calcular Profit Factor
                const winningTrades = trades.filter(t => t.profit > 0);
                const losingTrades = trades.filter(t => t.profit <= 0);
                const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
                const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
                const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : 'âˆž';

                // Actualizar estadÃ­sticas
                document.getElementById('finalCapital').textContent = `â‚¬${finalCapital.toFixed(2)}`;
                // Agregar mÃ©tricas adicionales
                const statsContainer = document.getElementById('stats');
                if (!document.getElementById('maxDrawdown')) {
                    statsContainer.innerHTML += `
                <div class="stat-card">
                    <div class="stat-label">Drawdown MÃ¡x</div>
                    <div class="stat-value" id="maxDrawdown">-</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Profit Factor</div>
                    <div class="stat-value" id="profitFactor">-</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                    <div class="stat-label">SeÃ±ales LONG</div>
                    <div class="stat-value" id="longSignals">-</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                    <div class="stat-label">SeÃ±ales SHORT</div>
                    <div class="stat-value" id="shortSignals">-</div>
                </div>
            `;
                }

                document.getElementById('maxDrawdown').textContent = `${maxDrawdown.toFixed(2)}%`;
                document.getElementById('profitFactor').textContent = profitFactor;
                document.getElementById('longSignals').textContent = longSignals;
                document.getElementById('shortSignals').textContent = shortSignals;

                // Agregar info de multi-timeframe si estÃ¡ activo
                if (multiTF === 'enabled' && !document.getElementById('filteredSignals')) {
                    statsContainer.innerHTML += `
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <div class="stat-label">ðŸš« Filtradas (Multi-TF)</div>
                    <div class="stat-value" id="filteredSignals">-</div>
                </div>
            `;
                }

                // Renderizar grÃ¡fico y tabla
                renderPriceChart(data, trades, oscillator, fastLen, slowLen, bias);
                renderTradesTable(trades);

            } catch (error) {
                console.error('Error en backtest:', error);
                alert('Error ejecutando backtest: ' + error.message);
            } finally {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('stats').style.display = 'flex';
                document.getElementById('priceChartContainer').style.display = 'block';
                document.getElementById('tradesTableContainer').style.display = 'block';
            }
        }

        // ============================================
        // OPTIMIZATION FUNCTIONS
        // ============================================

    function openOptimizationModal() {
            document.getElementById('optimizationModal').style.display = 'block';
        }

    function closeOptimizationModal() {
            document.getElementById('optimizationModal').style.display = 'none';
        }

        window.onclick = function (event) {
            const modal = document.getElementById('optimizationModal');
            if (event.target == modal) {
                closeOptimizationModal();
            }
        }

    async function startOptimization() {
            const fastMin = parseInt(document.getElementById('optFastMin').value);
            const fastMax = parseInt(document.getElementById('optFastMax').value);
            const slowMin = parseInt(document.getElementById('optSlowMin').value);
            const slowMax = parseInt(document.getElementById('optSlowMax').value);
            const biasMin = parseFloat(document.getElementById('optBiasMin').value);
            const biasMax = parseFloat(document.getElementById('optBiasMax').value);
            const fastStep = parseInt(document.getElementById('optFastStep').value);
            const slowStep = parseInt(document.getElementById('optSlowStep').value);
            const biasStep = parseFloat(document.getElementById('optBiasStep').value);
            const target = document.getElementById('optTarget').value;

            if (fastMin >= fastMax || slowMin >= slowMax || biasMin >= biasMax) {
                alert('âš ï¸ Los valores mÃ­nimos deben ser menores que los mÃ¡ximos');
                return;
            }

            if (slowMin <= fastMax) {
                alert('âš ï¸ Slow EMA mÃ­nimo debe ser mayor que Fast EMA mÃ¡ximo');
                return;
            }

            document.getElementById('optStartBtn').disabled = true;
            document.getElementById('optStartBtn').textContent = 'â³ Optimizando...';
            document.getElementById('optProgress').style.display = 'block';
            document.getElementById('optResults').style.display = 'none';

            // Get current configuration
            const currentSymbol = document.getElementById('symbol').value;
            const currentTimeframe = document.getElementById('timeframe').value;
            const currentCapital = parseFloat(document.getElementById('capital').value);
            const currentLeverage = parseFloat(document.getElementById('leverage').value);

            console.log('ðŸ”§ Iniciando optimizaciÃ³n de parÃ¡metros...');
            console.log(`   SÃ­mbolo: ${currentSymbol}, Timeframe: ${currentTimeframe} `);
            console.log(`   Fast EMA: ${fastMin} -${fastMax} (paso ${fastStep})`);
            console.log(`   Slow EMA: ${slowMin} -${slowMax} (paso ${slowStep})`);
            console.log(`   Bias: ${biasMin} -${biasMax} (paso ${biasStep})`);

            // Fetch data once
            try {
                const data = await fetchBinanceData(currentSymbol, currentTimeframe);

                // Calculate total combinations
                const fastRange = Math.floor((fastMax - fastMin) / fastStep) + 1;
                const slowRange = Math.floor((slowMax - slowMin) / slowStep) + 1;
                const biasRange = Math.floor((biasMax - biasMin) / biasStep) + 1;
                const totalCombinations = fastRange * slowRange * biasRange;

                console.log(`   Total de combinaciones a probar: ${totalCombinations} `);
                document.getElementById('optStatus').textContent = `Probando ${totalCombinations} combinaciones...`;

                const results = [];
                let tested = 0;

                // Test all combinations
                for (let fast = fastMin; fast <= fastMax; fast += fastStep) {
                    for (let slow = slowMin; slow <= slowMax; slow += slowStep) {
                        for (let bias = biasMin; bias <= biasMax; bias += biasStep) {
                            tested++;

                            // Update progress
                            const progress = (tested / totalCombinations * 100).toFixed(1);
                            document.getElementById('optProgressBar').style.width = progress + '%';
                            document.getElementById('optProgressBar').textContent = progress + '%';
                            document.getElementById('optStatus').textContent = `Probando ${tested} / ${totalCombinations}: Fast = ${fast}, Slow = ${slow}, Bias = ${bias.toFixed(2)}`;

                            // Run backtest with these parameters
                            const result = await runBacktestWithParams(data, fast, slow, bias, currentCapital, currentLeverage);

                            // Store result
                            results.push({
                                fast,
                                slow,
                                bias: parseFloat(bias.toFixed(3)),
                                ...result
                            });

                            // Allow UI to update every 10 combinations
                            if (tested % 10 === 0) {
                                await new Promise(resolve => setTimeout(resolve, 0));
                            }
                        }
                    }
                }

                console.log(`âœ… OptimizaciÃ³n completada: ${results.length} resultados`);

                // Sort results by target metric
                results.sort((a, b) => {
                    switch (target) {
                        case 'roi': return b.roi - a.roi;
                        case 'profit': return b.profit - a.profit;
                        case 'profitFactor': return (b.profitFactor || 0) - (a.profitFactor || 0);
                        case 'winRate': return b.winRate - a.winRate;
                        case 'sharpe': return (b.sharpe || 0) - (a.sharpe || 0);
                        default: return b.roi - a.roi;
                    }
                });

                // Display top 10 results
                displayOptimizationResults(results.slice(0, 10));

                // Re-enable button
                document.getElementById('optStartBtn').disabled = false;
                document.getElementById('optStartBtn').textContent = 'ðŸš€ Iniciar OptimizaciÃ³n';
                document.getElementById('optProgress').style.display = 'none';
                document.getElementById('optResults').style.display = 'block';

            } catch (error) {
                console.error('âŒ Error en optimizaciÃ³n:', error);
                alert('Error durante la optimizaciÃ³n: ' + error.message);
                document.getElementById('optStartBtn').disabled = false;
                document.getElementById('optStartBtn').textContent = 'ðŸš€ Iniciar OptimizaciÃ³n';
            }
        }

    async function runBacktestWithParams(data, fastPeriod, slowPeriod, biasMultiplier, capital, leverage) {
            // Calculate EMAs
            const times = data.map(d => d.time);
            const closes = data.map(d => d.close);

            const fastEMA = calculateEMA(closes, fastPeriod);
            const slowEMA = calculateEMA(closes, slowPeriod);

            // Calculate oscillator
            const oscillator = fastEMA.map((fast, i) => (fast - slowEMA[i]) * biasMultiplier);

            // Run backtest
            let balance = capital;
            let position = null;
            let trades = [];

            for (let i = 1; i < closes.length; i++) {
                const prevOsc = oscillator[i - 1];
                const currOsc = oscillator[i];
                const price = closes[i];

                // Entry signals
                if (!position) {
                    if (prevOsc < 0 && currOsc >= 0) {
                        // LONG signal
                        position = {
                            type: 'LONG',
                            entryPrice: price,
                            entryIndex: i,
                            entryBalance: balance
                        };
                    } else if (prevOsc > 0 && currOsc <= 0) {
                        // SHORT signal
                        position = {
                            type: 'SHORT',
                            entryPrice: price,
                            entryIndex: i,
                            entryBalance: balance
                        };
                    }
                }
                // Exit signals
                else {
                    let shouldClose = false;

                    if (position.type === 'LONG' && prevOsc > 0 && currOsc <= 0) {
                        shouldClose = true;
                    } else if (position.type === 'SHORT' && prevOsc < 0 && currOsc >= 0) {
                        shouldClose = true;
                    }

                    if (shouldClose) {
                        const priceChange = position.type === 'LONG'
                            ? (price - position.entryPrice) / position.entryPrice
                            : (position.entryPrice - price) / position.entryPrice;

                        const leveragedReturn = priceChange * leverage;
                        const commission = 0.0008; // 0.08% total (0.04% entry + 0.04% exit)
                        const netReturn = leveragedReturn - commission;
                        const profit = balance * netReturn;

                        balance += profit;

                        trades.push({
                            type: position.type,
                            entryPrice: position.entryPrice,
                            exitPrice: price,
                            profit: profit,
                            balance: balance
                        });

                        position = null;
                    }
                }
            }

            // Calculate metrics
            const roi = ((balance - capital) / capital) * 100;
            const totalTrades = trades.length;
            const winners = trades.filter(t => t.profit > 0).length;
            const winRate = totalTrades > 0 ? (winners / totalTrades) * 100 : 0;

            const totalWins = trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
            const totalLosses = Math.abs(trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
            const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? 999 : 0);

            // Calculate Sharpe Ratio (simplified)
            const returns = trades.map(t => (t.profit / capital) * 100);
            const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
            const stdDev = returns.length > 1
                ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
                : 0;
            const sharpe = stdDev > 0 ? (avgReturn / stdDev) : 0;

            return {
                finalBalance: balance,
                roi,
                profit: balance - capital,
                totalTrades,
                winners,
                winRate,
                profitFactor,
                sharpe,
                trades
            };
        }

    function displayOptimizationResults(results) {
            const tbody = document.getElementById('optResultsBody');
            tbody.innerHTML = '';

            results.forEach((result, index) => {
                const row = document.createElement('tr');
                row.className = 'opt-result-row';

                const roiClass = result.roi > 0 ? 'positive' : 'negative';

                row.innerHTML = `
        < td > <strong>${index + 1}</strong></td >
            <td>${result.fast}</td>
            <td>${result.slow}</td>
            <td>${result.bias.toFixed(3)}</td>
            <td class="${roiClass}"><strong>${result.roi.toFixed(2)}%</strong></td>
            <td>${result.totalTrades}</td>
            <td>${result.winRate.toFixed(1)}%</td>
            <td>${result.profitFactor.toFixed(2)}</td>
            <td>
                <button onclick="applyOptimizedParams(${result.fast}, ${result.slow}, ${result.bias})" 
                        style="padding: 5px 10px; font-size: 0.85em; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                    âœ… Aplicar
                </button>
            </td>
        `;

                tbody.appendChild(row);
            });

            console.log('ðŸ“Š Top 5 configuraciones:');
            results.slice(0, 5).forEach((r, i) => {
                console.log(`   ${i + 1}.Fast = ${r.fast}, Slow = ${r.slow}, Bias = ${r.bias.toFixed(3)} â†’ ROI: ${r.roi.toFixed(2)} %, Trades: ${r.totalTrades}, WinRate: ${r.winRate.toFixed(1)} % `);
            });
        }

    function applyOptimizedParams(fast, slow, bias) {
            // Update UI inputs (usando los IDs correctos)
            document.getElementById('fastEMA').value = fast;
            document.getElementById('slowEMA').value = slow;
            document.getElementById('biasMult').value = bias;

            // Close modal
            closeOptimizationModal();

            // Ejecutar backtest automÃ¡ticamente con los nuevos parÃ¡metros
            const mode = document.getElementById('tradingMode').value;

            console.log(`âœ… ParÃ¡metros optimizados aplicados: Fast = ${fast}, Slow = ${slow}, Bias = ${bias}`);
            console.log(`ðŸ”„ Re - ejecutando ${mode === 'backtest' ? 'backtest' : 'paper trading'} con nuevos parÃ¡metros...`);

            // PequeÃ±o delay para que el usuario vea el cambio en los inputs
            setTimeout(() => {
                if (mode === 'backtest') {
                    runBacktest();
                } else if (mode === 'paper') {
                    stopTrading();
                    setTimeout(() => startPaperTrading(), 500);
                }
            }, 300);
        }

    function resetToDefaultParams() {
            // ParÃ¡metros originales de la estrategia
            const defaultParams = {
                fastEMA: 20,
                slowEMA: 50,
                bias: 0
            };

            document.getElementById('fastEMA').value = defaultParams.fastEMA;
            document.getElementById('slowEMA').value = defaultParams.slowEMA;
            document.getElementById('biasMult').value = defaultParams.bias;

            console.log('ðŸ”„ ParÃ¡metros restaurados a valores default');
            
            // Mostrar confirmaciÃ³n visual
            const confirmDiv = document.createElement('div');
            confirmDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
                z-index: 10001;
                font-weight: 600;
            `;
            confirmDiv.textContent = `ðŸ”„ ParÃ¡metros restaurados a valores default`;
            document.body.appendChild(confirmDiv);

            setTimeout(() => confirmDiv.remove(), 3000);
        }

        // ========= UI CONTROL HANDLERS =========
        // Handle Stop Loss Type changes
        document.getElementById('stopLossType').addEventListener('change', function () {
            const slType = this.value;
            const slMultiplierGroup = document.getElementById('slMultiplierGroup');
            const slPercentGroup = document.getElementById('slPercentGroup');

            if (slType === 'smart') {
                slMultiplierGroup.style.display = 'block';
                slPercentGroup.style.display = 'none';
            } else if (slType === 'fixed') {
                slMultiplierGroup.style.display = 'none';
                slPercentGroup.style.display = 'block';
            } else {
                slMultiplierGroup.style.display = 'none';
                slPercentGroup.style.display = 'none';
            }
        });

        // Handle Take Profit Type changes
        document.getElementById('takeProfitType').addEventListener('change', function () {
            const tpType = this.value;
            const tpMultiplierGroup = document.getElementById('tpMultiplierGroup');
            const tpPercentGroup = document.getElementById('tpPercentGroup');

            if (tpType === 'smart') {
                tpMultiplierGroup.style.display = 'block';
                tpPercentGroup.style.display = 'none';
            } else if (tpType === 'fixed') {
                tpMultiplierGroup.style.display = 'none';
                tpPercentGroup.style.display = 'block';
            } else {
                tpMultiplierGroup.style.display = 'none';
                tpPercentGroup.style.display = 'none';
            }
        });

        // ========= ERROR OVERLAY =========
    function ensureErrorOverlay() {
            if (!document.getElementById('errorOverlay')) {
                const div = document.createElement('div');
                div.id = 'errorOverlay';
                div.style.position = 'fixed';
                div.style.top = '10px';
                div.style.right = '10px';
                div.style.zIndex = '9999';
                div.style.maxWidth = '420px';
                div.style.background = 'rgba(220,38,38,0.95)';
                div.style.color = '#fff';
                div.style.fontFamily = 'Inter, sans-serif';
                div.style.fontSize = '12px';
                div.style.padding = '12px 16px';
                div.style.borderRadius = '10px';
                div.style.boxShadow = '0 4px 18px rgba(0,0,0,0.4)';
                div.style.display = 'none';
                div.innerHTML = '<strong>Errores:</strong><br><ul style="margin:6px 0 0;padding-left:18px" id="errorList"></ul>';
                document.body.appendChild(div);
            }
        }
    function showErrorOverlay(err) {
            ensureErrorOverlay();
            const overlay = document.getElementById('errorOverlay');
            const list = document.getElementById('errorList');
            const li = document.createElement('li');
            li.textContent = (err && err.message) ? err.message : String(err);
            list.appendChild(li);
            overlay.style.display = 'block';
        }
        window.addEventListener('error', ev => {
            showErrorOverlay(ev.error || ev.message);
        });
        window.addEventListener('unhandledrejection', ev => {
            showErrorOverlay(ev.reason);
        });

        // ========= CONFIGURAR EVENT LISTENERS PARA BOTONES =========
        document.getElementById('startBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ BotÃ³n Iniciar Trading clickeado');
            startTrading();
        });
        
        document.getElementById('stopBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ BotÃ³n Stop Trading clickeado');
            stopTrading();
        });
        
        document.getElementById('optimizeBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ BotÃ³n Optimizar clickeado');
            openOptimizationModal();
        });
        
        document.getElementById('resetBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ BotÃ³n Reset clickeado');
            resetToDefaultParams();
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ Cerrar modal clickeado');
            closeOptimizationModal();
        });
        
        document.getElementById('optStartBtn').addEventListener('click', function() {
            console.log('ðŸ”˜ Iniciar optimizaciÃ³n clickeado');
            startOptimization();
        });
        
        // Exponer TODAS las funciones al scope global para acceso desde cualquier parte
        window.startTrading = startTrading;
        window.stopTrading = stopTrading;
        window.runBacktest = runBacktest;
        window.startPaperTrading = startPaperTrading;
        window.openOptimizationModal = openOptimizationModal;
        window.closeOptimizationModal = closeOptimizationModal;
        window.startOptimization = startOptimization;
        window.applyOptimizedParams = applyOptimizedParams;
        window.resetToDefaultParams = resetToDefaultParams;
        
        console.log('âœ… AplicaciÃ³n inicializada correctamente');
        console.log('âœ… Event listeners configurados');
        console.log('âœ… Funciones expuestas globalmente:', Object.keys(window).filter(k => k.includes('Trading') || k.includes('Optimization') || k.includes('Params') || k.includes('Backtest')));
        
        }); // FIN DOMContentLoaded

    
