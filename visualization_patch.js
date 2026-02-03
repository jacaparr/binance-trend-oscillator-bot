
// ==================== VISUALIZATION PATCH ====================
// Add this code to enable charts and tables

function renderPriceChart(data, trades) {
    const canvas = document.getElementById('priceChart');
    if (!canvas) { console.log('Canvas not found'); return; }

    const ctx = canvas.getContext('2d');
    if (window.priceChartInstance) window.priceChartInstance.destroy();

    const labels = data.map(d => new Date(d.time));
    const prices = data.map(d => d.close);

    const buyPoints = [];
    const sellPoints = [];

    trades.forEach(trade => {
        const entryIndex = data.findIndex(d => d.time >= new Date(trade.entryTime).getTime());
        if (entryIndex !== -1) {
            if (trade.type === 'LONG') {
                buyPoints.push({ x: labels[entryIndex], y: trade.entry });
            } else {
                sellPoints.push({ x: labels[entryIndex], y: trade.entry });
            }
        }
    });

    window.priceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Precio',
                    data: prices,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'LONG',
                    data: buyPoints,
                    backgroundColor: '#10b981',
                    pointRadius: 8,
                    showLine: false,
                    type: 'scatter'
                },
                {
                    label: 'SHORT',
                    data: sellPoints,
                    backgroundColor: '#ef4444',
                    pointRadius: 8,
                    showLine: false,
                    type: 'scatter'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
                x: { type: 'time', time: { unit: 'day' } },
                y: { beginAtZero: false }
            }
        }
    });

    document.getElementById('priceChartContainer').style.display = 'block';
    console.log('📊 Chart rendered with', trades.length, 'trades');
}

function renderTradesTable(trades) {
    const container = document.getElementById('tradesTableContainer');
    if (!container) { console.log('Table container not found'); return; }

    let tbody = container.querySelector('tbody');
    if (!tbody) {
        const table = container.querySelector('table');
        if (table) {
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
        } else {
            console.log('Table not found');
            return;
        }
    }

    tbody.innerHTML = '';

    trades.slice().reverse().forEach((trade, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trades.length - index}</td>
            <td>${new Date(trade.entryTime).toLocaleString('es-ES')}</td>
            <td>${new Date(trade.exitTime).toLocaleString('es-ES')}</td>
            <td class="${trade.type === 'LONG' ? 'long' : 'short'}">${trade.type}</td>
            <td>${trade.entry.toFixed(4)}</td>
            <td>${trade.exit.toFixed(4)}</td>
            <td>${trade.closeReason}</td>
            <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">${trade.pnl.toFixed(2)}%</td>
        `;
        tbody.appendChild(row);
    });

    container.style.display = 'block';
    console.log('📋 Table rendered with', trades.length, 'trades');
}

// Patch runBacktest to call visualizations
const originalConsoleLog = console.log;
console.log = function (...args) {
    if (args[0] === '✅ Backtest completado') {
        // Hook into the completion message
        setTimeout(() => {
            const statsDiv = document.getElementById('stats');
            if (statsDiv && statsDiv.style.display === 'grid') {
                console.log('🎨 Attempting to render visualizations...');
                // Try to get data from global scope if available
                if (window.lastBacktestData && window.lastBacktestTrades) {
                    renderPriceChart(window.lastBacktestData, window.lastBacktestTrades);
                    renderTradesTable(window.lastBacktestTrades);
                }
            }
        }, 100);
    }
    originalConsoleLog.apply(console, args);
};

console.log('🎨 Visualization patch loaded');
