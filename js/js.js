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
	ct.children[1].style = 'resize:both; overflow:scroll;'
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
	el({a:'div', b:b, c:'📲', d:{'data-a':JSON.stringify({state:1, width:300, height:600})}, e:{click:a => {
		if (iframe.parentElement == ctDesktop) {
			ctMobile.style.display = 'flex'
			ctMobile.children[1].appendChild(iframe)
		} else {
			ctMobile.style.display = 'none'
			ctDesktop.appendChild(iframe)
		}
	}} })
	
	el({a:'div', b:b })
	el({a:'div', b:b, c:'Run', e:{click: b => {
		document.body.appendChild(ct)
		iframe.srcdoc = createPage(codemirror.getValue())
	}} })
	
	const text = el({a:'textarea', b:el({a:'div', b:a.children[1]}) })
	text.value = 
`
function onInit() {
	console.log('a')
}

function onTick(candle) {
	console.log('b')
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
<script src="js/chartOption-v01.js"></script>
<script src="js/dataLoader.js"></script>
<script src="js/series-v01.js"></script>
<script src="js/backtest-v01.js"></script>
<script src="js/trade-result.js"></script>
<script>`
+ a +
`addEventListener('load', async () => {
	//setTimeout(async()=>{
		console.log(abe)
		// abe = Algorithmic Backtesting Engine
		abe.chart1 = echarts.init(document.getElementById('chart1'), 'dark')
		abe.xAxis = []
		abe.candle = []
		
		onInit()
		
		const data = await abe.loadData()
		data.forEach(candle => {
			abe.xAxis.push(new Date(candle.t).toISOString())
			abe.candle.push([candle.o, candle.c, candle.l, candle.h])
			onTick(candle)
		})
		abe.chart1.setOption(abe.createChartOption(abe.xAxis, [
			abe.createCandlestick(abe.candle),
			//abe.createLine('H1', a.h1, 0, '#6a5acd', 1, 1), //(name, data, yAxisIndex, color, opacity, width)
			//abe.createLine('L1', a.l1, 0, '#6a5acd', 1, 1),
		]))
	//}, 1000)
})

</script>
</head><body>
<div id="chart1" style="width:1700px; height:800px;"></div>
</body>
</html>`