const newEngine = a => {
	
	const ct = dlg({title:''}).parentElement
	ct.style = ''
	ct.className = 'pop1'
	ct.children[0].style = ''
	ct.children[0].textContent = ''
	el({a:'div', b:ct.children[0]})
	el({a:'div', b:ct.children[0], c:'Chart'})
	el({a:'div', b:ct.children[0], d:{class:'fa fa-close'}, e:{click: b => {
		ct.remove()
	} }})
	ct.children[1].remove()
	ct.children[1].style = 'resize:both; overflow:scroll; width:70vw; height:70vh;'
	const iframe = el({a:'iframe', b:ct.children[1]})
	ct.remove()
	
	a = dlg({title:''}).parentElement
	a.style = ''
	a.className = 'pop1'
	a.children[0].style = ''
	a.children[0].textContent = ''
	el({a:'div', b:a.children[0], d:{class:'fa fa-caret-down'}, e:{click: b => {
		((a,b,c) => a.contains(b) ? a.replace(b, c) : a.replace(c, b) )(b.target.classList, 'fa-caret-down', 'fa-caret-right')
		a.children[1].classList.toggle('hide')
	} }})
	el({a:'div', b:a.children[0], c:'Trading Sistem'})
	el({a:'div', b:a.children[0], d:{class:'fa fa-close'}, e:{click: b => {
		a.remove()
	} }})
	//a.removeChild(a.children[1])
	a.children[1].remove()
	a.children[1].style = ''
	
	const b = el({a:'div', b:a.children[1]})
	el({a:'div', b:b })
	el({a:'button', b:b.children[0], c:'data' })
	// choose data from github ar provide own data
	// if choose data from github, choose timeframe and data range
	el({a:'button', b:b.children[0], c:'loadScript' })
	// load from external script
	
	el({a:'div', b:b })
	el({a:'div', b:b, c:'Run', e:{click: b => {
		document.body.appendChild(ct)
		iframe.srcdoc = createPage(codemirror.getValue())
	}} })
	
	const text = el({a:'textarea', b:el({a:'div', b:a.children[1]}) })
	text.value = 
`
function onInit() {
	//abe.createBacktestEngine(initialBalance, feePercent, slippagePoint)
	initBacktestEngine(1000, 0.6, 0) // = (initialBalance = 1000, feePercent = 0, slippagePoint = 0)
	
	userData.maPeriod = 14
	userData.maBuffer = []
	userData.maSum = 0
	userData.maLine = []
	
	addChart({
		name: 'Moving Average',
		type: 'line',
		data: userData.maLine,
	})
	
}

function onTick(candle) {
	userData.maBuffer.push(candle.c)
	userData.maSum += candle.c
	if (userData.maBuffer.length === userData.maPeriod) {
		userData.maLine.push(userData.maSum / userData.maPeriod)
		userData.maSum -= userData.maBuffer.shift()
		
	} else {
		userData.maLine.push(null)
	}
	
	//sendOrder(side("BUY" | "SELL"), price, qty, entryPrice, params = {tp: , sl: , comment:}) return orderId
	//modifyOrder(orderId, newTp, newSl)
	//closeOrder(id)
}
`
	const codemirror = CodeMirror.fromTextArea(text, {lineNumbers: true, mode: 'javascript', })
	el({a:'a', b:a.children[1], c:'powered by CodeMirror', d:{href:'https://codemirror.net/', style:'text-align:right;padding:0 21px;'}})
	
}

const createPage = a =>
`<!DOCTYPE html><html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backtesting Engine</title>
<link href="favicon.svg" rel="icon" sizes="any" type="image/svg+xml">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script src="js/echarts.min.js"></script>
<script src="js/engine.js?v=001"></script>
<script src="js/trade-result.js"></script>
<script>
let addChart, initBacktestEngine, sendOrder, modifyOrder, closeOrder
const userData = {}
`
+ a +
`
addEventListener('load', async () => {
	let engine
	initBacktestEngine = (initialBalance = 1000, feePercent = 0, slippagePoint = 0) => { engine = new BacktestEngine(initialBalance, feePercent, slippagePoint) }
	
	addChart = params => { engine.addChart(params) }
	sendOrder = (side, price, qty, time, params = {}) => { engine.sendOrder(side, price, qty, time, params = {}) }
	modifyOrder = (id, newTp = null, newSl = null) =>  { engine.modifyOrder(id, newTp = null, newSl = null) }
	closeOrder = id => { engine.closeOrder(id, candle.c, candle.t) }
	const chart1 = echarts.init(document.getElementById('chart1'), 'dark')
	
	//const trade = []
	
	onInit()
	
	const data = await engine.loadData('data/30m/2025-01-01.json')
	data.forEach(candle => {
		engine.update(candle)
		onTick(candle)
	})
	
	chart1.setOption(engine.createChartOption())
	
})

</script>
</head><body>
<div id="chart1" style="width:95vw; height:95vh;"></div>
</body>
</html>`