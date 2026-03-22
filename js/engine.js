class BacktestEngine {

// --------------------
// Visualization
// --------------------

#chartOption = {
	animation: false,
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'cross' },
		position: (pos, params, el, elRect, size) => pos[0] < size.viewSize[0] / 2 ? ({top:10, right:30}) : ({top:10, left:30}),
	},
	axisPointer: { link: { xAxisIndex: 'all' }, },
	dataZoom: [
		{ type: 'inside', xAxisIndex: [0, 1], startValue: 0, endValue: 100 },
		{ type: 'slider', xAxisIndex: [0, 1], bottom: '2%', brushSelect: false, startValue: 0, endValue: 100 }
	],
	// Membagi Ruang (Spatial Disparity) menjadi 2 Grafik
	grid: [
		{ left: '8%', right: '8%', top: '5%', height: '65%' },    // Grafik OHLC (Atas)
		{ left: '8%', right: '8%', top: '71%', height: '20%' }    // Grafik Sebaran Bar (Bawah)
	],
	xAxis: [
		{
			type: 'category',
			data: [],
			gridIndex: 0,
			boundaryGap: true,
			axisLabel: { show: false }, // Sembunyikan label waktu di grafik atas agar rapi
			axisTick: { show: false },
			axisPointer: {
				label: {
					show: false // KUNCI: Mematikan kotak tooltip tanggal/waktu di sumbu X atas
				}
			}
		},
		{
			type: 'category',
			data: [],
			gridIndex: 1,
			boundaryGap: true
		}
	],
	yAxis: [
		{
			type: 'value',
			gridIndex: 0,
			scale: true, // Sumbu harga OHLC otomatis
			name: 'Price'
		},
		{ 
			type: 'value',
			gridIndex: 1,
			name: 'Indicator',
			splitLine: { show: true }
		}
	],
	series: [{
		type: 'candlestick',
		data: [],
		zlevel: 1,
		xAxisIndex: 0,
		yAxisIndex: 0,
		itemStyle: {
			color: '#51ff51',//upColor,
			color0: '#ff5151',//downColor,
			borderColor: '#51ff51',//upBorderColor,
			borderColor0: '#ff5151',//downBorderColor
			opacity: 0.5,
		},
		markLine: {
			data: []
		},
		markPoint: {
			data: []
		},
	}],
}
#candlestickData = this.#chartOption.series[0].data
#xAxis = this.#chartOption.xAxis[0].data

// --------------------
// Backtest Engine
// --------------------

#balance
#equity
#feePercent
#slippage
#positions = []
#history = []

// Eksekusi Keluar Market
#executeExit = (index, pos, price, time, reason) => {
	pos.status = 'CLOSED'
	pos.exitPrice = price
	pos.exitTime = time
	pos.reason = reason
	
	// Hitung Gross PnL
	const rawPnl = pos.side === 'BUY' 
		? (pos.exitPrice - pos.entryPrice) * pos.qty
		: (pos.entryPrice - pos.exitPrice) * pos.qty
	
	// Potong Fee Exit
	const fee = pos.exitPrice * pos.qty * engine.feePercent
	pos.pnl += rawPnl - fee
	pos.grossPnL = rawPnl
	pos.fee += fee
	
	this.#balance += pos.pnl
	
	// Pindahkan ke history dan hapus dari array posisi aktif untuk efisiensi memori
	this.#history.push(pos)
	this.#positions.splice(index, 1)
	//this.#positions = this.#positions.filter(p => p.id !== pos.id)
	
	//console.log(`[CLOSED ${reason}] PnL: ${pos.pnl.toFixed(2)} at ${time}`);
}

// Logika Internal: Cek TP/SL
#checkExitConditions = (index, pos, bar) => {
	if (pos.side === 'BUY') {
		if (pos.sl && bar.l <= pos.sl) {
			this.#executeExit(index, pos, pos.sl, bar.t, "SL")
			return true
		}
		if (pos.tp && bar.h >= pos.tp) {
			this.#executeExit(index, pos, pos.tp, bar.t, "TP")
			return true
		}
		return false
	} else {
		if (pos.sl && bar.h >= pos.sl) {
			this.#executeExit(index, pos, pos.sl, bar.t, "SL")
			return true
		}
		else if (pos.tp && bar.l <= pos.tp) {
			this.#executeExit(index, pos, pos.tp, bar.t, "TP")
			return true
		}
		return false
	}
	return false
}

#updateEquity = price => {
	let floatingPnl = 0
	this.#positions.forEach(pos => {
		floatingPnl += pos.side === 'BUY' 
			? (price - pos.entryPrice) * pos.qty
			: (pos.entryPrice - price) * pos.qty;
	})
	this.#equity = this.#balance + floatingPnl
}

constructor(initialBalance, feePercent, slippagePoint) {
	this.#balance = initialBalance
	this.#equity = initialBalance
	this.#feePercent = feePercent / 100, // Misal: 0.1% menjadi 0.001
	this.#slippage = slippagePoint
	
	Object.freeze(this)
}

// --------------------
// Visualization
// --------------------

addChart(params) {
	this.#chartOption.series.push(params)
}

createChartOption() {
	this.#chartOption.xAxis[1].data = this.#xAxis
	
	const series = this.#chartOption.series
	const markLine = series[0].markLine.data
	const markPoint = series[0].markPoint.data
	
	for (let i = series.length - 1; i > -1; i--) {
		
		if (series[i].type) {
			
			if (series[i].type === 'markLine') {
				markLine.push(series[i])
				series.splice(i, 1)
			}
			else if (series[i].type === 'markPoint') {
				markPoint.push(series[i])
				series.splice(i, 1)
			}
		}
	}
	return this.#chartOption
}

// --------------------
// Data Loader
// --------------------

async loadData(apiUrl) {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), 20000)
	
	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			signal: controller.signal
		})

		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		return await response.json()
		//return await response.text()
	} catch (error) {
		console.error('Fetch error:', error.message)
		return `{ error: ${error.message} }`
	} finally {
		clearTimeout(timeoutId)
	}
}

// --------------------
// Backtest Engine
// --------------------

update(bar) {
	// Cek TP/SL untuk posisi yang masih terbuka
	for (let i = this.#positions.length - 1; i > -1; i--) {
		this.#checkExitConditions(i, this.#positions[i], bar)
	}
	
	// Update Equity (Floating P/L)
	this.#updateEquity()
	
	// Visualization
	this.#candlestickData.push([bar.o, bar.c, bar.l, bar.h])
	const xAxis = new Date(bar.t).toISOString()
	this.#xAxis.push(xAxis)
}

// Send Order (Entry)
sendOrder(side, price, qty, time, params = {}) {
	// Simulasi Slippage
	const entryPrice = side === 'BUY'
		? price + this.#slippage
		: price - this.#slippage
	
	// Potong Fee Entry
	const fee = entryPrice * (qty || 1) * this.#feePercent
	this.#balance -= fee
	
	const pos = {
		id: this.#history.length + this.#positions.length +1,
		side: side,
		entryPrice: entryPrice,
		entryTime: time,
		qty: qty || 1,
		tp: params.tp || null,
		sl: params.sl || null,
		status: 'OPEN',
		pnl: -fee,
		grossPnL: 0,
		fee: fee,
		exitPrice: null,
		exitTime: null,
		comment: params.comment || ""
	}
	
	this.#positions.push(pos)
	//console.log(`[ORDER ${side}] @ ${entryPrice} at ${time}`)
	return pos.id
	
}

// Modifikasi TP / SL Dinamis (Trailing)
modifyOrder(id, newTp, newSl) {//(params) {//(id, newTp, newSl) => {
	const pos = this.#positions.find(p => p.id === id)
	if (pos) {
		if (newTp) pos.tp = newTp
		if (newSl) pos.sl = newSl
		//console.log(`[MODIFY] Order ${id} updated -> TP: ${pos.tp}, SL: ${pos.sl}`);
	}
}

// Close Order Manual
closeOrder(id, price, time) {
	const index = this.#positions.findIndex(p => p.id === id)
	
	if (index > -1) {
		this.#executeExit(index, this.#positions[index], price, time, "MANUAL_CLOSE")
		return true
		
	} else return false
	
}

getStats() {
	const totalTrades = this.#history.length
	const wins = this.#history.filter(h => h.pnl > 0).length
	return {
		finalBalance: this.#balance,
		totalTrades: totalTrades,
		winRate: totalTrades > 0 ? (wins / totalTrades * 100).toFixed(2) + "%" : "0%",
		history: this.#history
	}
}

}
