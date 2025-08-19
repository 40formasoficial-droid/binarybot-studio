function runBacktest() {
    const asset = document.getElementById('asset').value;
    const strategy = document.getElementById('strategy').value;
    const log = document.getElementById('log-output');
    
    log.textContent = `🔍 Analisando ${asset} com estratégia: ${getStrategyName(strategy)}...\n\n`;
    
    const rawData = document.getElementById('market-data').textContent;
    const data = JSON.parse(rawData);
    
    let wins = 0, losses = 0, profit = 0;
    let details = '';

    for (let i = 3; i < data.length - 1; i++) {
        const current = data[i];
        const next = data[i + 1];
        const close = current.close;
        
        const recent = data.slice(i-2, i+1);
        const support = Math.min(...recent.map(d => d.low));
        const resistance = Math.max(...recent.map(d => d.high));

        let signal = null;

        if (strategy === 'sr') {
            if (close <= support * 1.005) {
                signal = 'CALL';
            } else if (close >= resistance * 0.995) {
                signal = 'PUT';
            }
        }

        if (strategy === 'candle') {
            const body = Math.abs(current.open - current.close);
            const lowerWick = current.close > current.open 
                ? current.open - current.low 
                : current.close - current.low;
            const range = current.high - current.low;

            if (lowerWick > body * 2 && range > 0 && body < range * 0.4) {
                signal = 'CALL';
            }
        }

        if (signal) {
            const outcome = (signal === 'CALL' && next.close > close) || 
                            (signal === 'PUT' && next.close < close) 
                            ? 'win' : 'loss';

            if (outcome === 'win') {
                wins++;
                profit += 90;
                details += `✅ [${data[i].time}] ${signal} → Win (+$90)\n`;
            } else {
                losses++;
                profit -= 100;
                details += `❌ [${data[i].time}] ${signal} → Loss (-$100)\n`;
            }
        }
    }

    const total = wins + losses;
    const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

    document.getElementById('total').textContent = total;
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('winrate').textContent = winrate + '%';
    document.getElementById('profit').textContent = '$' + profit.toFixed(2);

    log.textContent += details;
    log.textContent += `\n✅ Backtest finalizado.\n📊 ${total} operações | ${winrate}% de acerto | Saldo: $${profit.toFixed(2)}`;
}

function getStrategyName(strat) {
    const names = {
        'sr': 'Suporte & Resistência',
        'candle': 'Padrões de Candle',
        'mix': 'Mista'
    };
    return names[strat] || strat;
}

function clearLogs() {
    document.getElementById('log-output').textContent = 'Logs limpos.';
    document.getElementById('total').textContent = '0';
    document.getElementById('wins').textContent = '0';
    document.getElementById('losses').textContent = '0';
    document.getElementById('winrate').textContent = '0%';
    document.getElementById('profit').textContent = '$0';
}