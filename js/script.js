//======================================================================
// Script Loader
//======================================================================
const BASE = 'https://raw.githubusercontent.com/miftahul001/js-algorithmic-backtesting-engine/main'
const menuData = [
	{ label: 'Load from disk', file: null },
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
			el({a:'div', b:dropdown, d:{class:'dropdown-divider'}}); return
		}
		if (!item.children) {
			el({a:'div', b:dropdown, c:item.label, d:{class:'dropdown-item'}, e:{
				click: () => { closeDropdown(); fileInput.codemirror = codemirror; fileInput.button.click() }
			}}); return
		}
		const parent = el({a:'div', b:dropdown, d:{class:'dropdown-item'}, e:{
			mouseenter: () => {
				const sub = el({a:'div', b:parent, d:{class:'dropdown-sub'}})
				const pr = parent.getBoundingClientRect()
				sub.style.top  = `${pr.top}px`
				sub.style.left = `${pr.right - 3}px`
				parent._sub = sub
				item.children.forEach(child => {
					el({a:'div', b:sub, c:child.label, d:{class:'dropdown-item'}, e:{
						click: () => { closeDropdown(); loadFromUrl(child.file, codemirror) }
					}})
				})
			},
			mouseleave: () => { parent._sub?.remove(); parent._sub = null }
		}})
		el({a:'span', b:parent, c:item.label})
		el({a:'span', b:parent, c:'›', d:{class:'dropdown-arrow'}})
	})
	setTimeout(() => { document.addEventListener('click', closeDropdown, {once: true}) }, 0)
}
//======================================================================
// end of Script Loader
//======================================================================

//======================================================================
// Trading Stats
//======================================================================
const fillStats = (parent, data) => {
	parent.innerHTML = ''
	const pnl = data.history.reduce((s, t) => s + t.pnl, 0)
	const createBox = (label, value, colorClass = '') => {
		const box = el({a:'div', b:parent, d:{class:'stat-box'}})
		el({a:'div', b:box, c:label, d:{class:'stat-box-label'}})
		el({a:'div', b:box, c:value, d:{class:`stat-box-value ${colorClass}`}})
	}
	createBox('Final Balance', `$${data.finalBalance.toFixed(2)}`)
	createBox('Total P&L',    `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl >= 0 ? 'positive' : 'negative')
	createBox('Win Rate',     data.winRate)
	createBox('Total Trades', data.history.length)
}
//======================================================================
// end of Trading Stats
//======================================================================

//======================================================================
// Trading History
//======================================================================
const fillHist = (parent, data) => {
	parent.innerHTML = ''
	const table  = el({a:'table', b:parent, d:{class:'trading-history'}})
	const header = el({a:'tr', b:el({a:'thead', b:table})})
	;['No','Id','Side','Qty','Status','TP','SL',
	  'Entry Time','Entry Price','Exit Time','Exit Price',
	  'PnL','Gross PnL','Fee','Total','Reason','Comment'
	].forEach(h => el({a:'th', b:header, c:h}))

	const tbody = el({a:'tbody', b:table})
	let total = 0
	data.forEach((t, i) => {
		const tr = el({a:'tr', b:tbody})
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
		el({a:'td', b:tr, c:t.pnl.toFixed(2),     d:{class:t.pnl >= 0 ? 'td-positive' : 'td-negative'}})
		el({a:'td', b:tr, c:t.grossPnL.toFixed(2)})
		el({a:'td', b:tr, c:t.fee.toFixed(2)})
		el({a:'td', b:tr, c:total.toFixed(2),      d:{class:total >= 0 ? 'td-positive' : 'td-negative'}})
		el({a:'td', b:tr, c:t.reason})
		el({a:'td', b:tr, c:t.comment || '-'})
	})
}
//======================================================================
// end of Trading History
//======================================================================

//======================================================================
// Status Bar
//======================================================================
const setStatus = data => {
	const pnl   = data.history.reduce((s, t) => s + t.pnl, 0)
	const wins  = data.history.filter(t => t.pnl > 0).length
	const total = data.history.length
	const wr    = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'
	const sign  = pnl >= 0 ? '+' : ''
	document.getElementById('status-summary').textContent =
		`${total} trades · ${wr}% win · ${sign}$${pnl.toFixed(2)}`
}
//======================================================================
// end of Status Bar
//======================================================================

//======================================================================
// Run Engine
//======================================================================
const createPage = a =>
`<!DOCTYPE html><html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backtesting Engine</title>
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
	addChart    = params              => { if (engine) engine.addChart(params); else pendingCharts.push(params) }
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
//======================================================================
// end of Run Engine
//======================================================================

//======================================================================
// Main Init
//======================================================================
addEventListener('load', () => {

	//------------------------------------------------------------------
	// CodeMirror
	//------------------------------------------------------------------
	const codemirror = CodeMirror.fromTextArea(
		document.getElementById('editor-textarea'),
		{ lineNumbers: true, mode: 'javascript', theme: 'dracula' }
	)
	codemirror.setValue(
`// place your variables here

const maPeriod = 14
const maBuffer = []
const maLine   = []
let maSum = 0

function onInit() {
	//initBacktestEngine(initialBalance, feePercent, slippagePoint)
	//initBacktestEngine(1000, 0.05, 0)

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
`)

	//------------------------------------------------------------------
	// DOM refs
	//------------------------------------------------------------------
	const iframe    = document.getElementById('result-iframe')
	const statsWrap = document.getElementById('stats-wrap')
	const histWrap  = document.getElementById('hist-wrap')

	iframe.onload = () => {
		iframe.contentWindow.fillStats = data => {
			fillStats(statsWrap, data)
			fillHist(histWrap, data.history)
			setStatus(data)
		}
	}

	//------------------------------------------------------------------
	// Tab switching
	//------------------------------------------------------------------
	const rtabs   = [...document.querySelectorAll('.rtab')]
	const rpanels = [...document.querySelectorAll('.rpanel')]
	rtabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const idx = +tab.getAttribute('data-index')
			rtabs.forEach(t   => t.classList.remove('active'))
			rpanels.forEach(p => p.classList.remove('active'))
			tab.classList.add('active')
			rpanels[idx].classList.add('active')
		})
	})

	//------------------------------------------------------------------
	// Toolbar buttons
	//------------------------------------------------------------------
	document.getElementById('btn-load').addEventListener('click', e => {
		e.stopPropagation()
		buildDropdown(e.currentTarget, codemirror)
	})

	document.getElementById('btn-save').addEventListener('click', () => {
		const blob = new Blob([codemirror.getValue()], {type: 'text/javascript'})
		const url  = URL.createObjectURL(blob)
		const a    = document.createElement('a')
		a.href = url; a.download = 'strategy.js'; a.click()
		URL.revokeObjectURL(url)
	})

	document.getElementById('btn-run').addEventListener('click', () => {
		rtabs.forEach(t   => t.classList.remove('active'))
		rpanels.forEach(p => p.classList.remove('active'))
		rtabs[0].classList.add('active')
		rpanels[0].classList.add('active')
		iframe.srcdoc = createPage(codemirror.getValue())
	})

	//------------------------------------------------------------------
	// Pane resizer
	//------------------------------------------------------------------
	const resizer    = document.getElementById('pane-resizer')
	const editorPane = document.querySelector('.editor-pane')
	const appMain    = document.querySelector('.app-main')

	resizer.addEventListener('mousedown', e => {
		e.preventDefault()
		resizer.classList.add('dragging')
		const onMove = e => {
			const r   = appMain.getBoundingClientRect()
			const pct = ((e.clientX - r.left) / r.width) * 100
			if (pct > 15 && pct < 80) editorPane.style.width = `${pct}%`
		}
		const onUp = () => {
			resizer.classList.remove('dragging')
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
		}
		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

})
//======================================================================
// end of Main Init
//======================================================================
