const atrPeriod = 14
const atrLine   = []
const trBuffer  = []
let trSum = 0
let prevClose = null

function onInit() {
	addChart({
		name: `ATR ${atrPeriod}`,
		type: 'line',
		xAxisIndex: 1,
		yAxisIndex: 1,
		data: atrLine,
	})
}

function onTick(candle) {
	if (prevClose === null) {
		atrLine.push(null)
		prevClose = candle.c
		return
	}
	
	// Mencari True Range (TR)
	const hl = candle.h - candle.l
	const hpc = Math.abs(candle.h - prevClose)
	const lpc = Math.abs(candle.l - prevClose)
	const tr = Math.max(hl, hpc, lpc)
	
	trBuffer.push(tr)
	trSum += tr
	
	if (trBuffer.length === atrPeriod) {
		atrLine.push(trSum / atrPeriod)
		trSum -= trBuffer.shift()
	} else {
		atrLine.push(null)
	}
	prevClose = candle.c
}