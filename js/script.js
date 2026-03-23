//======================================================================
// Script Loader
//======================================================================
const BASE = 'https://raw.githubusercontent.com/miftahul001/js-algorithmic-backtesting-engine/main'
const menuData = [
	{
		label: 'Load from disk',
		file: null
	},
	{ divider: true },
	{
		label: 'Indicators',
		children: [
			{ label: 'SMA', file: `${BASE}/indicators/sma.js` },
			{ label: 'EMA', file: `${BASE}/indicators/ema.js` },
			{ label: 'ATR', file: `${BASE}/indicators/atr.js` },
		]
	},
	{ divider: true },
	{
		label: 'EA',
		children: [
			{ label: 'MA Crossover', file: `${BASE}/ea/ma-crossover.js` },
		]
	},
]

const fileInput = { button: el({a:'input', b:document.body, d:{
	type:'file', accept:'.js', style:'display:none'
}, e:{change: a => {
	const file = a.target.files[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = e => {
		fileInput.codemirror.setValue(e.target.result)
		fileInput.codemirror = null
		closeDropdown()
	}
	reader.readAsText(file)
}}}) }

const loadFromUrl = async (url, codemirror) => {
	try {
		const text = await fetch(url).then(r => {
			if (!r.ok) throw new Error(`HTTP ${r.status}`)
			return r.text()
		})
		codemirror.setValue(text)
	} catch(e) {
		alert(`Failed to load: ${e.message}`)
	}
}

let dropdown = null
const closeDropdown = () => { dropdown?.remove(); dropdown = null }

const buildDropdown = (anchorEl, codemirror) => {
	closeDropdown()
	dropdown = el({a:'div', b:document.body, d:{class:'dropdown-wrap'}})

	const rect = anchorEl.getBoundingClientRect()
	dropdown.style.top  = `${rect.bottom + 4}px`
	dropdown.style.left = `${rect.left}px`

	menuData.forEach(item => {

		if (item.divider) {
			el({a:'div', b:dropdown, d:{class:'dropdown-divider'}})
			return
		}

		if (!item.children) {
			el({a:'div', b:dropdown, c:item.label, d:{class:'dropdown-item'}, e:{
				click: () => {
					closeDropdown()
					fileInput.codemirror = codemirror
					fileInput.button.click()
				}
			}})
			return
		}

		const parent = el({a:'div', b:dropdown, d:{class:'dropdown-item'}, e:{
			mouseenter: () => {
				const sub = el({a:'div', b:document.body, d:{class:'dropdown-sub'}})
				const pr = parent.getBoundingClientRect()
				sub.style.top  = `${pr.top}px`
				sub.style.left = `${pr.right - 3}px`
				parent._sub = sub

				item.children.forEach(child => {
					el({a:'div', b:sub, c:child.label, d:{class:'dropdown-item'}, e:{
						click: () => {
							closeDropdown()
							loadFromUrl(child.file, codemirror)
						}
					}})
				})
			},
			mouseleave: () => {
				parent._sub?.remove()
				parent._sub = null
			}
		}})
		el({a:'span', b:parent, c:item.label})
		el({a:'span', b:parent, c:'›', d:{class:'dropdown-arrow'}})
	})

	setTimeout(() => {
		document.addEventListener('click', closeDropdown, {once: true})
	}, 0)
}
//======================================================================
// end of Script Loader
//======================================================================

//======================================================================
// Trading Stats
//======================================================================
const fillStats = (parent, data) => {
	parent.innerHTML = ''

	const createBox = (label, value, colorClass = '') => {
		const box = el({a:'div', b:parent, d:{class:'stat-box'}})
		el({a:'div', b:box, c:label, d:{class:'stat-box-label'}})
		el({a:'div', b:box, c:value, d:{class:`stat-box-value ${colorClass}`}})
	}

	const pnl = data.history.reduce((sum, t) => sum + t.pnl, 0)

	createBox('Final Balance', `$${data.finalBalance.toFixed(2)}`)
	createBox('Total P&L',     `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,  pnl >= 0 ? 'positive' : 'negative')
	createBox('Win Rate',      data.winRate)
	createBox('Total Trades',  data.history.length)
}
//======================================================================
// end of Trading Stats
//======================================================================

//======================================================================
// Trading History
//======================================================================
const fillHist = (parent, data) => {
	parent.innerHTML = ''
	const table = el({a:'table', b:parent, d:{class:'trading-history'}})

	const header = el({a:'tr', b:el({a:'thead', b:table})});
	['No','Id','Side','Qty','Status','TP','SL',
		'Entry Time','Entry Price','Exit Time','Exit Price',
		'PnL','Gross PnL','Fee','Total','Reason','Comment'
	].forEach(h => el({a:'th', b:header, c:h}))
	
	const tbody = el({a:'tbody', b:table})
	let total = 0
	
	data.forEach((t, i) => {
		const tr = el({a:'tr', b:tbody})
		const pnlColor = t.pnl >= 0 ? 'td-positive' : 'td-negative'
		total += t.pnl

		el({a:'td', b:tr, c:`${i + 1}`})
		el({a:'td', b:tr, c:t.id})
		el({a:'td', b:tr, c:t.side === 'BUY' ? '⮝' : t.side === 'SELL' ? '⮟' : '?',
			d:{class: t.side === 'BUY' ? 'td-buy' : t.side === 'SELL' ? 'td-sell' : ''}})
		el({a:'td', b:tr, c:t.qty})
		el({a:'td', b:tr, c:t.status})
		el({a:'td', b:tr, c:t.tp ?? '-'})
		el({a:'td', b:tr, c:t.sl ?? '-'})
		el({a:'td', b:tr, c:new Date(t.entryTime).toISOString().replace('T',' ').slice(0,19)})
		el({a:'td', b:tr, c:t.entryPrice})
		el({a:'td', b:tr, c:t.exitTime ? new Date(t.exitTime).toISOString().replace('T',' ').slice(0,19) : '-'})
		el({a:'td', b:tr, c:t.exitPrice ?? '-'})
		el({a:'td', b:tr, c:t.pnl.toFixed(2),      d:{class:pnlColor}})
		el({a:'td', b:tr, c:t.grossPnL.toFixed(2)})
		el({a:'td', b:tr, c:t.fee.toFixed(2)})
		el({a:'td', b:tr, c:total.toFixed(2),        d:{class:total >= 0 ? 'td-positive' : 'td-negative'}})
		el({a:'td', b:tr, c:t.reason})
		el({a:'td', b:tr, c:t.comment || '-'})
	})
}
//======================================================================
// end of Trading History
//======================================================================

const newEngine = a => {

	//==================================================================
	// Result window
	//==================================================================
	const ct = dlg({title:''}).parentElement
	ct.style = `top:${71 + (11*document.body.children.length)}px; left:${103 + (11*document.body.children.length)}px`
	ct.className = 'pop1'
	ct.children[0].style = ''
	ct.children[0].textContent = ''
	el({a:'div', b:ct.children[0]})
	el({a:'div', b:ct.children[0], c:'Chart'})
	el({a:'div', b:ct.children[0], d:{class:'fa fa-close'}, e:{click: b => ct.remove()}})
	ct.children[1].remove()
	ct.children[1].style = ''
	el({a:'div', b:ct.children[1], d:{class:'result-toolbar'}})
	el({a:'div', b:ct.children[1].children[0], d:{class:'result-toolbar-inner'}})
	const iframe      = el({a:'iframe', b:el({a:'div', b:ct.children[1], d:{class:'result-panel'}})})
	const tradingStat = el({a:'div', d:{class:'stats-wrap'}})
	const tradingHist = el({a:'div'})

	// Tab bar
	const tabBar = el({a:'div', b:ct.children[1].children[0].children[0], d:{class:'tab-bar'}})
	const tabs = [
		{label:'Chart',           panel: iframe      },
		{label:'Trading Stats',   panel: tradingStat },
		{label:'Trading History', panel: tradingHist },
	]
	const switchTab = tab => {
		const lastActive = [...tabBar.children].find(t => t.classList.contains('active'))
		if (lastActive === tab) return
		lastActive.classList.remove('active')
		tab.classList.add('active')
		ct.children[1].children[1].children[0].remove()
		ct.children[1].children[1].appendChild(tabs[+tab.getAttribute('data-index')].panel)
	}
	tabs.forEach((tab, i) => {
		el({a:'div', b:tabBar, c:tab.label, d:{
			class: i === 0 ? 'tab-nav active' : 'tab-nav',
			'data-index': `${i}`,
		}, e:{click: a => switchTab(a.target)}})
	})

	iframe.onload = () => {
		iframe.contentWindow.fillStats = data => {
			fillStats(tradingStat, data)
			fillHist(tradingHist, data.history)
		}
	}
	ct.remove()
	//==================================================================
	// end of Result window
	//==================================================================

	//==================================================================
	// Script window
	//==================================================================
	a = dlg({title:''}).parentElement
	a.style = `top:${59 + (11*document.body.children.length)}px; left:${77 + (11*document.body.children.length)}px`
	a.className = 'pop1'
	a.children[0].style = ''
	a.children[0].textContent = ''
	el({a:'div', b:a.children[0], d:{class:'fa fa-caret-down'}, e:{click: b => {
		((a,b,c) => a.contains(b) ? a.replace(b, c) : a.replace(c, b))(b.target.classList, 'fa-caret-down', 'fa-caret-right')
		a.children[1].classList.toggle('hide')
	}}})
	el({a:'div', b:a.children[0], c:'Trading Sistem'})
	el({a:'div', b:a.children[0], d:{class:'fa fa-close'}, e:{click: b => a.remove()}})
	a.children[1].remove()
	a.children[1].style = ''

	const b = el({a:'div', b:a.children[1]})
	el({a:'div', b:b})
	el({a:'button', b:b.children[0], c:'data'})
	el({a:'button', b:b.children[0], c:'Load Script', e:{
		click: a => { a.stopPropagation(); buildDropdown(a.target, codemirror) }
	}})

	el({a:'div', b:b})
	el({a:'div', b:b, c:'Run', e:{click: b => {
		document.body.appendChild(ct)
		iframe.srcdoc = createPage(codemirror.getValue())
	}}})

	const text = el({a:'textarea', b:el({a:'div', b:a.children[1]})})
	text.value =
`
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

	//sendOrder('BUY'|'SELL', qty, { tp, sl, comment }) return orderId
	//modifyOrder(orderId, newTp, newSl)
	//closeOrder(id)
}
`
	const codemirror = CodeMirror.fromTextArea(text, {lineNumbers: true, mode: 'javascript'})
	el({a:'a', b:a.children[1], c:'powered by CodeMirror', d:{
		href:'https://codemirror.net/',
		style:'text-align:right; padding:0 21px;'
	}})
	//==================================================================
	// end of Script window
	//==================================================================
}

const createPage = a =>
`<!DOCTYPE html><html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backtesting Engine</title>
<link href="favicon.svg" rel="icon" sizes="any" type="image/svg+xml">
<script src="js/echarts.min.js"></script>
<script src="js/engine.js?v=001"></script>
<script>
let addChart, initBacktestEngine, sendOrder, modifyOrder, closeOrder
`
+ a +
`
addEventListener('load', async () => {
	let engine, currentCandle
	const pendingCharts = []
	
	initBacktestEngine = (initialBalance = 1000, feePercent = 0, slippagePoint = 0) => {
		engine = new BacktestEngine(initialBalance, feePercent, slippagePoint)
	}
	addChart    = params         => { if (engine) engine.addChart(params); else pendingCharts.push(params) }
	sendOrder   = (side, qty, params) => { engine.sendOrder(side, currentCandle.c, qty, currentCandle.t, params) }
	modifyOrder = (id, newTp, newSl)  => { engine.modifyOrder(id, newTp, newSl) }
	closeOrder  = id                  => { engine.closeOrder(id, currentCandle.c, currentCandle.t) }
	
	onInit()
	
	if (!engine) engine = new BacktestEngine(1000, 0, 0)
	pendingCharts.forEach(p => engine.addChart(p))
	pendingCharts.length = 0
	
	const data = await engine.loadData('data/30m/2025-01-01.json')
	data.forEach(candle => {
		engine.update(candle)
		currentCandle = candle
		onTick(candle)
	})
	
	const chart1 = echarts.init(document.getElementById('chart1'), 'dark')
	chart1.setOption(engine.createChartOption())
	fillStats(engine.getStats())
	
})
</script>
</head><body style="display:flex; margin:0; padding:0; height:100vh;">
<div id="chart1" style="flex:1 1 auto;"></div>
</body>
</html>`
