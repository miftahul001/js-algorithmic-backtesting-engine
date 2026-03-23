// place your variables here

// Fast MA (short period) dan Slow MA (long period)
const fastPeriod = 9
const slowPeriod = 21

const fastBuffer = [], slowBuffer = []
const fastLine = [], slowLine = []
let fastSum = 0, slowSum = 0
let openOrderId = null


function onInit() {
	initBacktestEngine(1000, 0.05, 0)

	addChart({
		name: `Fast MA (${fastPeriod})`,
		type: 'line',
		data: fastLine,
		symbol: 'none',
		lineStyle: { color: '#51ff51', width: 1 },
		xAxisIndex: 0,
		yAxisIndex: 0,
	})

	addChart({
		name: `Slow MA (${slowPeriod})`,
		type: 'line',
		data: slowLine,
		symbol: 'none',
		lineStyle: { color: '#ff5151', width: 1 },
		xAxisIndex: 0,
		yAxisIndex: 0,
	})

}

function onTick(candle) {

	// --- Hitung Fast MA ---
	fastBuffer.push(candle.c)
	fastSum += candle.c
	if (fastBuffer.length > fastPeriod) fastSum -= fastBuffer.shift()
	const fast = fastBuffer.length === fastPeriod ? fastSum / fastPeriod : null
	fastLine.push(fast)

	// --- Hitung Slow MA ---
	slowBuffer.push(candle.c)
	slowSum += candle.c
	if (slowBuffer.length > slowPeriod) slowSum -= slowBuffer.shift()
	const slow = slowBuffer.length === slowPeriod ? slowSum / slowPeriod : null
	slowLine.push(slow)

	// Belum cukup data untuk crossover
	if (!fast || !slow) return
	const prevFast = fastLine[fastLine.length - 2]
	const prevSlow = slowLine[slowLine.length - 2]
	if (!prevFast || !prevSlow) return

	// --- Golden Cross: fast memotong slow dari bawah ke atas → BUY ---
	if (prevFast <= prevSlow && fast > slow) {
		if (openOrderId !== null) {
			closeOrder(openOrderId)
			openOrderId = null
		}
		openOrderId = sendOrder('BUY', 0.01, {
			tp: candle.c * 1.03,
			sl: candle.c * 0.98,
			comment: 'Golden Cross'
		})
	}

	// --- Death Cross: fast memotong slow dari atas ke bawah → SELL ---
	if (prevFast >= prevSlow && fast < slow) {
		if (openOrderId !== null) {
			closeOrder(openOrderId)
			openOrderId = null
		}
		openOrderId = sendOrder('SELL', 0.01, {
			tp: candle.c * 0.97,
			sl: candle.c * 1.02,
			comment: 'Death Cross'
		})
	}

}
