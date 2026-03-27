const BASEURL = 'https://raw.githubusercontent.com/miftahul001/js-algorithmic-backtesting-engine/main'
//======================================================================
// External File Loader
//======================================================================
const loadExternalFile = (fileType, callback) => {
	const btn = el({a:'input', b:document.body, d:{
		type:'file', accept:fileType, style:'display:none'
	}, e:{change: a => {
		const file = a.target.files[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = e => { callback(e.target.result) }
		reader.readAsText(file)
		btn.remove()
	}}})
	btn.click()
	btn.remove()
}

const loadFromUrl = (url, callback) => {
	fetch(url).then(a=>a.text()).then(a=>{ callback(a) })
}
//======================================================================
// end of External File Loader
//======================================================================

//======================================================================
// Dropdown
//======================================================================
const closeDropdown = a => { el({a:'div', b:document.body, d:{style:`position:fixed; top:${a.clientY-5}px; left:${a.clientX-5}px; height:9px; width:9px;`}, e:{mouseleave:a=>{a.target.remove()}}}) }

const buildDropdown = (anchorEl, menu) => {
	const rect = anchorEl.getBoundingClientRect()
	const dropdown = el({a:'div',
		b:el({a:'div', b:document.body, d:{class:'dropdown-wrap', style:`top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height+5}px; padding-top:${rect.height+3}px;`}, e:{mouseleave:a=>{a.target.remove()}}}),
		d:{class:'dropdown-bg'}})
	
	menu.forEach(item => {
		if (item.data) return 
		if (item.divider) {
			el({a:'div', b:dropdown, d:{class:'dropdown-divider'}})
			return
		}
		if (!item.children) {
			el({a:'div', b:dropdown, c:item.label, d:{class:'dropdown-item'}, e:{ click: item.e }})
			return
		}
		const parent = el({a:'div', b:dropdown, d:{class:'dropdown-item'}})
		el({a:'span', b:parent, c:item.label})
		el({a:'span', b:parent, c:'›', d:{class:'dropdown-arrow'}})
		const sub = el({a:'div',
			b:el({a:'div', b:el({a:'div', b:parent}), d:{class:'dropdown-wrap'}}),
			d:{class:'dropdown-bg'}})
		
		if (item.children[0].type === 'checkbox') {
			item.children.forEach(child => {
				const d = menu[0].data.int.find(a=>a===child.label) ? {type: 'checkbox', value:child.label, checked: true } : {type: 'checkbox', value:child.label }
				el({a:'input',
					b:el({a:'label',
						b:el({a:'div', b:sub, d:{class:'dropdown-item'} }),
						c:child.label
					}),
					d: d,
					e: {change: menu[0].data.fn }
				})
			})
		}
		else {
			item.children.forEach(child => {
				el({a:'div', b:sub, c:child.label, d:{class:'dropdown-item', 'data-url':child.data}, e:{ click: menu[0].data.fn} })
			})
		}
	})
}
//======================================================================
// end of Dropdown
//======================================================================

//======================================================================
// Script Loader
//======================================================================
const menuScriptLoader = [
	{ data: { fn: a => {
			loadFromUrl(a.target.getAttribute('data-url'), menuScriptLoader[0].data.cb)
			closeDropdown(a)
		} }
	},
	{ label: 'Load from disk', e:e => { loadExternalFile('.js', menuScriptLoader[0].data.cb) } },
	{ divider: true },
	{
		label: 'Indicators',
		children: [
			{ label: 'SMA', data: `${BASEURL}/indicators/sma.js` },
			{ label: 'EMA', data: `${BASEURL}/indicators/ema.js` },
			{ label: 'ATR', data: `${BASEURL}/indicators/atr.js` },
		]
	},
	{ divider: true },
	{
		label: 'EA',
		children: [
			{ label: 'MA Crossover', data: `${BASEURL}/ea/ma-crossover.js` },
		]
	}
]
//======================================================================
// end of Script Loader
//======================================================================

//======================================================================
// Data Loader
//======================================================================
const menuDataLoader = [
	{ data: { ext:[], int:[], fn: e => {
			menuDataLoader[0].data.ext.length = 0
			const value = e.target.value
			if (!e.target.checked) {
				menuDataLoader[0].data.int.splice(menuDataLoader[0].data.int.findIndex(a=>a===value),1)
				return
			}
			const ln = value.length
			menuDataLoader[0].data.int = menuDataLoader[0].data.int.filter(a=>a.length === ln)
			menuDataLoader[0].data.int.push(value)
			e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll('input[type="checkbox"]:checked').forEach(a=>{
				if (a.value.length !== ln) a.checked = false
			})
		}}
	},
	{ label: 'Load from disk', e: a => { loadExternalFile('.json', a=> { menuDataLoader[0].data.int.length = 0; menuDataLoader[0].data.ext = JSON.parse(a) } ) } },
	{ divider: true },
	{
		label: 'D1',
		children: [
			{ label: '2025', type:'checkbox' }
		]
	},
	{ divider: true },
	{
		label: 'H1',
		children: [
			{ label: '2025-01', type:'checkbox' },
			{ label: '2025-02', type:'checkbox' },
			{ label: '2025-03', type:'checkbox' },
		]
	},
	{ divider: true },
	{
		label: 'M30',
		children: [
			{ label: '2025-01-01', type:'checkbox' },
			{ label: '2025-01-16', type:'checkbox' },
			{ label: '2025-02-01', type:'checkbox' },
			{ label: '2025-02-16', type:'checkbox' },
		]
	}
]
//======================================================================
// end of Data Loader
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
const DATA_LOADER_STATE = ${JSON.stringify({ ext: menuDataLoader[0].data.ext, int: menuDataLoader[0].data.int })}
let addChart, initBacktestEngine, sendOrder, modifyOrder, closeOrder
`
+ a +
`
const saveAs1=(filename, data, type) => { el({a:'a', b:document.body, d:{download:filename, href:URL.createObjectURL(new Blob([data], {type:type}))}, e:{click:a=>{document.body.removeChild(a.target)}}}).click() }
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
	
	if (DATA_LOADER_STATE.ext.length > 0) {
		DATA_LOADER_STATE.ext.forEach(candle => {
			engine.update(candle)
			currentCandle = candle
			onTick(candle)
		})
	}
	else {
		const data = []
		const path = DATA_LOADER_STATE.int[0].length === 10 ? 'data/30m/' : DATA_LOADER_STATE.int[0].length === 7 ? 'data/1h/' : 'data/1d/'
		for (const url of DATA_LOADER_STATE.int) {
			data.push(...await engine.loadData(path+url+'.json'))
			data.forEach(candle => {
				engine.update(candle)
				currentCandle = candle
				onTick(candle)
			})
		}
	}
	
	const chart1 = echarts.init(document.getElementById('chart1'), 'dark')
	chart1.setOption(engine.createChartOption())
	if (window.parent && window.parent.fillStats) { fillStats(engine.getStats()) }
	else { setTimeout(()=>{fillStats(engine.getStats())},1000) }
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
		menuScriptLoader[0].data.cb = a =>{ codemirror.setValue(a); menuScriptLoader[0].data.cb = null }
		buildDropdown(e.currentTarget, menuScriptLoader)
	})
	
	document.getElementById('btn-save').addEventListener('click', () => {
		const blob = new Blob([codemirror.getValue()], {type: 'text/javascript'})
		const url  = URL.createObjectURL(blob)
		const a    = document.createElement('a')
		a.href = url; a.download = 'strategy.js'; a.click()
		URL.revokeObjectURL(url)
	})
	
	document.getElementById('btn-data').addEventListener('click', e => {
		e.stopPropagation()
		buildDropdown(e.currentTarget, menuDataLoader, a=>{})
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
