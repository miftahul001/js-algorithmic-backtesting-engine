const createBacktestEngine = (initialBalance, feePercent, slippagePoint) => {
	const engine = {
		balance: initialBalance,
		equity: initialBalance,
		feePercent: feePercent / 100, // Misal: 0.1% menjadi 0.001
		slippage: slippagePoint,
		positions: [],
		history: [],
		currentTime: null,
		currentPrice: null,
		
		// 1. Update Engine dengan Bar terbaru
		update: (bar) => {
			engine.currentTime = bar.t;
			engine.currentPrice = bar.c;
			
			// Cek TP/SL untuk posisi yang masih terbuka
			engine.positions.forEach(pos => {
				engine.checkExitConditions(pos, bar);
			});
			
			// Update Equity (Floating P/L)
			engine.updateEquity();
		},
		
		// 2. Send Order (Entry)
		sendOrder: (side, price, time, params = {}) => {
			// Simulasi Slippage
			const entryPrice = side === 'BUY' 
				? price + engine.slippage 
				: price - engine.slippage;
			
			// Potong Fee Entry
			const fee = entryPrice * (params.qty || 1) * engine.feePercent;
			engine.balance -= fee;
			
			const pos = {
				id: engine.history.length + engine.positions.length +1,
				side: side,
				entryPrice: entryPrice,
				entryTime: time,
				qty: params.qty || 1,
				tp: params.tp || null,
				sl: params.sl || null,
				status: 'OPEN',
				pnl: -fee,
				grossPnL: 0,
				fee: fee,
				exitPrice: null,
				exitTime: null,
				comment: params.comment || ""
			};
			
			engine.positions.push(pos);
			//console.log(`[ORDER ${side}] @ ${entryPrice} at ${time}`);
			return pos.id;
		},
		
		// 3. Modifikasi TP / SL Dinamis (Trailing)
		modifyOrder: (id, newTp, newSl) => {
			const pos = engine.positions.find(p => p.id === id);
			if (pos) {
				if (newTp !== undefined && newTp !== null) pos.tp = newTp;
				if (newSl !== undefined && newSl !== null) pos.sl = newSl;
				//console.log(`[MODIFY] Order ${id} updated -> TP: ${pos.tp}, SL: ${pos.sl}`);
			}
		},
		
		// 4. Close Order Manual
		closeOrder: (id, price, time) => {
			const pos = engine.positions.find(p => p.id === id);
			if (pos) {
				engine.executeExit(pos, price, time, "MANUAL_CLOSE");
			}
		},
		
		// Logika Internal: Cek TP/SL
		checkExitConditions: (pos, bar) => {
			if (pos.side === 'BUY') {
				if (pos.sl && bar.l <= pos.sl) engine.executeExit(pos, pos.sl, bar.t, "SL");
				else if (pos.tp && bar.h >= pos.tp) engine.executeExit(pos, pos.tp, bar.t, "TP");
			} else {
				if (pos.sl && bar.h >= pos.sl) engine.executeExit(pos, pos.sl, bar.t, "SL");
				else if (pos.tp && bar.l <= pos.tp) engine.executeExit(pos, pos.tp, bar.t, "TP");
			}
		},
		
		// Eksekusi Keluar Market
		executeExit: (pos, price, time, reason) => {
			pos.status = 'CLOSED';
			pos.exitPrice = price;
			pos.exitTime = time;
			pos.reason = reason;
			
			// Hitung Gross PnL
			const rawPnl = pos.side === 'BUY' 
				? (pos.exitPrice - pos.entryPrice) * pos.qty
				: (pos.entryPrice - pos.exitPrice) * pos.qty;
			
			// Potong Fee Exit
			const fee = pos.exitPrice * pos.qty * engine.feePercent;
			pos.pnl += rawPnl - fee;
			pos.grossPnL = rawPnl
			pos.fee += fee
			
			engine.balance += pos.pnl;
			
			// Pindahkan ke history dan hapus dari array posisi aktif untuk efisiensi memori
			engine.history.push({...pos});
			engine.positions = engine.positions.filter(p => p.id !== pos.id);
			
			//console.log(`[CLOSED ${reason}] PnL: ${pos.pnl.toFixed(2)} at ${time}`);
		},
		
		updateEquity: () => {
			let floatingPnl = 0;
			engine.positions.forEach(pos => {
				floatingPnl += pos.side === 'BUY' 
					? (engine.currentPrice - pos.entryPrice) * pos.qty
					: (pos.entryPrice - engine.currentPrice) * pos.qty;
			});
			engine.equity = engine.balance + floatingPnl;
		},
		
		getStats: () => {
			const totalTrades = engine.history.length;
			const wins = engine.history.filter(h => h.pnl > 0).length;
			return {
				finalBalance: engine.balance,
				totalTrades: totalTrades,
				winRate: totalTrades > 0 ? (wins / totalTrades * 100).toFixed(2) + "%" : "0%",
				history: engine.history
			};
		}
	};
	return engine;
};

/*

const engine = createBacktestEngine(1000, 0.1, 0.5); // Modal 1000, fee 0.1%, slippage 0.5

bar.forEach(candle => {
    // 1. Update engine dengan harga baru
    engine.update(candle);

    // 2. Contoh Logika Entry berdasarkan Zigzag Anda
    if (zigzag.state === "UP" && !hasOpenPosition) {
        engine.sendOrder("BUY", candle.c, candle.t, { tp: candle.c + 500, sl: candle.c - 200 });
    }
    
    zigzag.process(candle);
});

// 3. Tampilkan hasil di tombol showTrade()
console.log(engine.getStats()); 
*/
