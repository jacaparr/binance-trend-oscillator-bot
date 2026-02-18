// ==========================================
// PAPER TRADING IMPLEMENTATION
// ==========================================

let paperTradingActive = false;
let paperTradingInterval = null;
let paperPosition = null;
let paperBalance = 1000;
let paperTrades = [];
let paperPriceHistory = [];

async function startPaperTrading() {
    console.log('💰 Iniciando Paper Trading Mejorado...');

    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('stats').style.display = 'none';

        const symbol = document.getElementById('symbol').value;
        const timeframe = document.getElementById('timeframe').value;
        const fastLen = parseInt(document.getElementById('fastEMA').value);
        const slowLen = parseInt(document.getElementById('slowEMA').value);
        const bias = parseFloat(document.getElementById('biasMult').value);
        paperBalance = parseFloat(document.getElementById('capital').value);
        const leverage = parseInt(document.getElementById('leverage').value);

        // Get filter settings from UI
        const rsiFilterEnabled = document.getElementById('rsiFilter').value === 'enabled';
        const adxFilterEnabled = document.getElementById('adxFilter').value === 'enabled';
        const adxMin = parseFloat(document.getElementById('adxThreshold').value);
        const volumeFilterEnabled = document.getElementById('volumeFilter').value === 'enabled';
        const trailingEnabled = document.getElementById('trailingStop').value === 'enabled';
        const trailingMult = parseFloat(document.getElementById('trailingMult').value);
        const cooldownLimit = parseInt(document.getElementById('cooldownBars').value);
        const oscThreshold = parseFloat(document.getElementById('oscThreshold').value);

        const slType = document.getElementById('stopLossType').value;
        const slMultiplier = parseFloat(document.getElementById('slMultiplier').value);
        const slPercent = parseFloat(document.getElementById('stopLoss').value);
        const tpType = document.getElementById('takeProfitType').value;
        const tpMultiplier = parseFloat(document.getElementById('tpMultiplier').value);
        const tpPercent = parseFloat(document.getElementById('takeProfit').value);

        // Get initial historical data for indicators (need more for RSI/ADX/VolSMA)
        const historicalData = await fetchBinanceData(symbol, timeframe, Math.max(slowLen, 100));
        paperPriceHistory = historicalData.map(d => d.close);
        const paperHighHistory = historicalData.map(d => d.high);
        const paperLowHistory = historicalData.map(d => d.low);
        const paperVolumeHistory = historicalData.map(d => d.volume);

        paperTradingActive = true;
        paperPosition = null;
        paperTrades = [];
        let cooldownCounter = 0;

        document.getElementById('loading').style.display = 'none';
        document.getElementById('stats').style.display = 'grid';

        console.log('✅ Paper Trading Mejorado iniciado');

        // Update every 5 seconds
        paperTradingInterval = setInterval(async () => {
            if (!paperTradingActive) {
                clearInterval(paperTradingInterval);
                return;
            }

            try {
                // Fetch latest price + volume
                const latestData = await fetchBinanceData(symbol, timeframe, 1);
                const currentPrice = latestData[0].close;
                const currentHigh = latestData[0].high;
                const currentLow = latestData[0].low;
                const currentVolume = latestData[0].volume;
                const currentTime = new Date(latestData[0].time);

                // Update history arrays
                paperPriceHistory.push(currentPrice);
                paperHighHistory.push(currentHigh);
                paperLowHistory.push(currentLow);
                paperVolumeHistory.push(currentVolume);

                const maxLen = Math.max(slowLen, 100);
                if (paperPriceHistory.length > maxLen) {
                    paperPriceHistory.shift();
                    paperHighHistory.shift();
                    paperLowHistory.shift();
                    paperVolumeHistory.shift();
                }

                if (cooldownCounter > 0) cooldownCounter--;

                // Calculate indicators using global functions from index.html
                const oscillator = calculateOscillator(paperPriceHistory, fastLen, slowLen, bias);
                const oscVal = oscillator[oscillator.length - 1];
                const prevOsc = oscillator[oscillator.length - 2];

                const atr = calculateATR(paperHighHistory, paperLowHistory, paperPriceHistory, 14);
                const currentATR = atr[atr.length - 1];

                const rsi = calculateRSI(paperPriceHistory, 14);
                const currentRSI = rsi[rsi.length - 1];

                const adx = calculateADX(paperHighHistory, paperLowHistory, paperPriceHistory, 14);
                const currentADX = adx[adx.length - 1];

                const volSMA = calculateSMA(paperVolumeHistory, 20);
                const currentVolSMA = volSMA[volSMA.length - 1];

                // 1. CHECK EXIT CONDITIONS
                if (paperPosition) {
                    let closeReason = null;

                    // A. Stop Loss / Take Profit
                    if (paperPosition.type === 'LONG') {
                        if (currentPrice <= paperPosition.sl) closeReason = 'Stop Loss';
                        if (currentPrice >= paperPosition.tp) closeReason = 'Take Profit';
                        if (oscVal < -oscThreshold) closeReason = 'Señal Contraria';
                    } else {
                        if (currentPrice >= paperPosition.sl) closeReason = 'Stop Loss';
                        if (currentPrice <= paperPosition.tp) closeReason = 'Take Profit';
                        if (oscVal > oscThreshold) closeReason = 'Señal Contraria';
                    }

                    // B. Trailing Stop Update
                    if (!closeReason && trailingEnabled) {
                        if (paperPosition.type === 'LONG') {
                            let newTrailingSL = currentPrice - (currentATR * trailingMult);
                            if (newTrailingSL > paperPosition.sl) paperPosition.sl = newTrailingSL;
                        } else {
                            let newTrailingSL = currentPrice + (currentATR * trailingMult);
                            if (newTrailingSL < paperPosition.sl) paperPosition.sl = newTrailingSL;
                        }
                    }

                    if (closeReason) {
                        const pnl = paperPosition.type === 'LONG'
                            ? ((currentPrice - paperPosition.entry) / paperPosition.entry) * 100 * leverage
                            : ((paperPosition.entry - currentPrice) / paperPosition.entry) * 100 * leverage;

                        // Apply estim. commission
                        const commission = 0.08 * leverage;
                        const netPnl = pnl - commission;

                        paperBalance += (paperBalance * netPnl / 100);

                        paperTrades.push({
                            type: paperPosition.type,
                            entry: paperPosition.entry,
                            exit: currentPrice,
                            entryTime: paperPosition.entryTime,
                            exitTime: currentTime,
                            pnl: netPnl,
                            closeReason: closeReason
                        });

                        console.log(`🔴 CLOSED ${paperPosition.type} at ${currentPrice} (${closeReason}). Net PnL: ${netPnl.toFixed(2)}%`);

                        if (closeReason === 'Stop Loss') cooldownCounter = cooldownLimit;
                        paperPosition = null;
                        updatePaperStats();
                    }
                } else if (cooldownCounter === 0) {
                    // 2. CHECK ENTRY FILTERS
                    const isTrending = !adxFilterEnabled || currentADX > adxMin;
                    const highVolume = !volumeFilterEnabled || currentVolume > currentVolSMA;

                    // LONG SIGNAL
                    if (prevOsc < oscThreshold && oscVal >= oscThreshold) {
                        if (isTrending && highVolume && (!rsiFilterEnabled || currentRSI > 50)) {
                            let sl, tp;
                            if (slType === 'smart') {
                                sl = currentPrice - (currentATR * slMultiplier);
                            } else if (slType === 'fixed') {
                                sl = currentPrice * (1 - slPercent / 100);
                            } else { sl = 0; }

                            if (tpType === 'smart') {
                                tp = currentPrice + (currentATR * tpMultiplier);
                            } else if (tpType === 'fixed') {
                                tp = currentPrice * (1 + tpPercent / 100);
                            } else { tp = 999999999; }

                            paperPosition = { type: 'LONG', entry: currentPrice, sl, tp, entryTime: currentTime };
                            console.log(`🟢 LONG paper at ${currentPrice}, SL: ${sl.toFixed(2)}, TP: ${tp.toFixed(2)}`);
                        }
                    }
                    // SHORT SIGNAL
                    else if (prevOsc > -oscThreshold && oscVal <= -oscThreshold) {
                        if (isTrending && highVolume && (!rsiFilterEnabled || currentRSI < 50)) {
                            let sl, tp;
                            if (slType === 'smart') {
                                sl = currentPrice + (currentATR * slMultiplier);
                            } else if (slType === 'fixed') {
                                sl = currentPrice * (1 + slPercent / 100);
                            } else { sl = 999999999; }

                            if (tpType === 'smart') {
                                tp = currentPrice - (currentATR * tpMultiplier);
                            } else if (tpType === 'fixed') {
                                tp = currentPrice * (1 - tpPercent / 100);
                            } else { tp = 0; }

                            paperPosition = { type: 'SHORT', entry: currentPrice, sl, tp, entryTime: currentTime };
                            console.log(`🔴 SHORT paper at ${currentPrice}, SL: ${sl.toFixed(2)}, TP: ${tp.toFixed(2)}`);
                        }
                    }
                }

                updatePaperStats();

            } catch (error) {
                console.error('❌ Error en Paper Trading loop:', error);
            }
        }, 5000); // Update every 5 seconds

    } catch (error) {
        console.error('❌ Error iniciando Paper Trading:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Error: ' + error.message);
    }
}

function stopPaperTrading() {
    console.log('⏹ Deteniendo Paper Trading...');
    paperTradingActive = false;
    if (paperTradingInterval) {
        clearInterval(paperTradingInterval);
        paperTradingInterval = null;
    }
    console.log('✅ Paper Trading detenido');
}

function updatePaperStats() {
    const initialCapital = parseFloat(document.getElementById('capital').value);
    const profit = paperBalance - initialCapital;
    const roi = (profit / initialCapital) * 100;
    const wins = paperTrades.filter(t => t.pnl > 0).length;
    const winRate = paperTrades.length > 0 ? (wins / paperTrades.length) * 100 : 0;

    document.getElementById('finalCapital').textContent = `€${paperBalance.toFixed(2)}`;
    document.getElementById('profit').textContent = `€${profit.toFixed(2)}`;
    document.getElementById('roi').textContent = `${roi.toFixed(2)}%`;
    document.getElementById('totalTrades').textContent = paperTrades.length;
    document.getElementById('winRate').textContent = `${winRate.toFixed(2)}%`;

    // Update status badge if exists
    const statusDiv = document.getElementById('tradingStatus');
    if (statusDiv) {
        if (paperPosition) {
            statusDiv.innerHTML = `🟢 POSICIÓN ABIERTA: ${paperPosition.type} @ ${paperPosition.entry.toFixed(2)}`;
            statusDiv.style.display = 'block';
        } else {
            statusDiv.innerHTML = '💰 Paper Trading Activo - Esperando señal...';
            statusDiv.style.display = 'block';
        }
    }
}

console.log('💰 Paper Trading module loaded');
