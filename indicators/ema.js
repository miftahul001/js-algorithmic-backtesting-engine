// place your variables here

const emaPeriod = 14
const emaLine = []
const multiplier = 2 / (emaPeriod + 1)
let emaValue = null
let warmupCount = 0
let warmupSum = 0


function onInit() {
	//initBacktestEngine(initialBalance = 1000, feePercent = 0.5, slippagePoint = 0.5)
	//initBacktestEngine(1000, 0.6, 0)

	addChart({
		name: `EMA (${emaPeriod})`,
		type: 'line',
		data: emaLine,
		symbol: 'none',
		lineStyle: { color: '#f0c040', width: 1.5 },
		xAxisIndex: 0,
		yAxisIndex: 0,
	})

}

function onTick(candle) {
	if (emaValue === null) {
		// Warm-up: gunakan SMA periode pertama sebagai seed EMA
		warmupCount++
		warmupSum += candle.c
		if (warmupCount === emaPeriod) {
			emaValue = warmupSum / emaPeriod
			emaLine.push(emaValue)
		} else {
			emaLine.push(null)
		}
	} else {
		// EMA = close * multiplier + prevEMA * (1 - multiplier)
		emaValue = candle.c * multiplier + emaValue * (1 - multiplier)
		emaLine.push(emaValue)
	}

}
