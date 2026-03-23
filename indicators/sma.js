// place your variables here

const maPeriod = 14
const maBuffer = []
const maLine = []
let maSum = 0


function onInit() {
	//initBacktestEngine(initialBalance = 1000, feePercent = 0.5, slippagePoint = 0.5)
	//initBacktestEngine(1000, 0.6, 0)
	
	addChart({
		name: 'Moving Average',
		type: 'line',
		data: maLine,
	})
	
}

function onTick(candle) {
	maBuffer.push(candle.c)
	maSum += candle.c
	if (maBuffer.length === maPeriod) {
		maLine.push(maSum / maPeriod)
		maSum -= maBuffer.shift()
		
	} else {
		maLine.push(null)
	}
	
}

