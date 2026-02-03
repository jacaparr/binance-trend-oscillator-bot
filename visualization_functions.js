// ==========================================
// VISUALIZATION FUNCTIONS - ADD TO EXISTING SCRIPT
// ==========================================

function renderPriceChart(data, trades) {
    const canvas = document.getElementById('priceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if any
    if (window.priceChartInstance) {
        window.priceChartInstance.destroy();
    }

    const labels = data.map(d => new Date(d.time));
    const prices = data.map(d => d.close);

    // Trade markers
    const buyPoints = [];
    const sellPoints = [];

    trades.forEach(trade => {
        const entryIndex = data.findIndex(d => d.time >= new Date(trade.entryTime).getTime());
        const exitIndex = data.findIndex(d => d.time >= new Date(trade.exitTime).getTime());

        if (entryIndex !== -1) {
            if (trade.type === 'LONG') {
                buy Points.push({ x: labels[entryIndex], y: trade.entry });
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
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Compra (LONG)',
                    data: buyPoints,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false,
                    type: 'scatter'
                },
                {
                    label: 'Venta (SHORT)',
                    data: sellPoints,
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false,
                    type: 'scatter'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day' },
                    display: true
                },
                y: {
                    display: true,
                    beginAtZero: false
                }
            }
        }
    });

    document.getElementById('priceChartContainer').style.display = 'block';
}

function renderTradesTable(trades) {
    const container = document.getElementById('tradesTableContainer');
    if (!container) return;

    const tbody = container.querySelector('tbody');
    if (!tbody) return;

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
}

function showErrorOverlay(error) {
    const errorDiv = document.getElementById('errorOverlay');
    if (errorDiv) {
        errorDiv.innerHTML = `
            <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 12px; color: #991b1b;">
                <h3 style="margin: 0 0 10px 0;">❌ Error</h3>
                <p style="margin: 0;">${error.message || error}</p>
            </div>
        `;
        errorDiv.style.display = 'block';
    } else {
        alert('Error: ' + (error.message || error));
    }
}

console.log('📊 Visualization functions loaded');
