//======================================================================
// Script Loader
//======================================================================
// Data struktur menu — update seiring repo berkembang
const BASE = 'https://raw.githubusercontent.com/miftahul001/js-algorithmic-backtesting-engine/main'
const menuData = [
	{
		label: 'Load from disk',
		file: null   // trigger file input
	},
	{ divider: true },
	{
		label: 'Indicators',
		children: [
			{ label: 'SMA',  file: `${BASE}/indicators/sma.js`  },
			{ label: 'EMA',  file: `${BASE}/indicators/ema.js`  },
			{ label: 'ATR',  file: `${BASE}/indicators/atr.js`  },
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

// File input tersembunyi
const fileInput = {button: el({a:'input', b:document.body, d:{
	type:'file', accept:'.js', style:'display:none'
}, e:{change: a => {
	const file = a.target.files[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = e => { fileInput.codemirror.setValue(e.target.result); fileInput.codemirror = null }
	reader.readAsText(file)
	dropdown && dropdown.remove()
}}})
}

// Load dari raw URL
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

// Dropdown element
let dropdown = null

const closeDropdown = () => { dropdown?.remove(); dropdown = null }

const buildDropdown = (anchorEl, codemirror) => {
	closeDropdown()
	dropdown = el({a:'div', b:document.body, d:{style:`
		position:fixed;
		background:rgba(255,255,255,0.97);
		border:0.5px solid rgba(0,0,0,0.15);
		border-radius:7px;
		box-shadow:0 4px 16px rgba(0,0,0,0.12);
		min-width:180px;
		padding:4px 0;
		z-index:9999;
		font-size:13px;
	`}})
	
	// Posisi relatif terhadap button
	const rect = anchorEl.getBoundingClientRect()
	dropdown.style.top  = `${rect.bottom + 4}px`
	dropdown.style.left = `${rect.left}px`
	
	const itemStyle = `
		padding:6px 14px; cursor:pointer; display:flex;
		justify-content:space-between; align-items:center;
		color:rgba(0,0,0,0.8);`
	const hoverOn  = e => e.target.style.background = 'rgba(0,0,0,0.06)'
	const hoverOff = e => e.target.style.background = 'transparent'
	
	menuData.forEach(item => {
		
		// Divider
		if (item.divider) {
			el({a:'div', b:dropdown, d:{style:'border-top:0.5px solid rgba(0,0,0,0.1); margin:4px 0;'}})
			return
		}
		
		// Item tanpa children
		if (!item.children) {
			el({a:'div', b:dropdown, c:item.label, d:{style:itemStyle}, e:{
				mouseenter: hoverOn,
				mouseleave: hoverOff,
				click: () => {
					closeDropdown()
					fileInput.codemirror = codemirror
					fileInput.button.click()
				}
			}})
			return
		}
		
		// Item dengan submenu
		const parent = el({a:'div', b:dropdown, d:{style:itemStyle + 'position:relative;'}, e:{
			mouseenter: e => {
				hoverOn(e)
				// Buka submenu
				const sub = el({a:'div', b:parent, d:{style:`
					position:fixed;
					background:rgba(255,255,255,0.97);
					border:0.5px solid rgba(0,0,0,0.15);
					border-radius:7px;
					box-shadow:0 4px 16px rgba(0,0,0,0.12);
					min-width:160px;
					padding:4px 0;
					z-index:10000;
					font-size:13px;
				`}})
				const pr = parent.getBoundingClientRect()
				sub.style.top  = `${pr.top}px`
				sub.style.left = `${pr.right -3 }px`
				parent._sub = sub
				
				item.children.forEach(child => {
					el({a:'div', b:sub, c:child.label, d:{style:itemStyle}, e:{
						mouseenter: hoverOn,
						mouseleave: hoverOff,
						click: () => {
							closeDropdown()
							loadFromUrl(child.file, codemirror)
						}
					}})
				})
			},
			mouseleave: e => {
				hoverOff(e)
				parent._sub?.remove()
				parent._sub = null
			}
		}})
		el({a:'span', b:parent, c:item.label})
		el({a:'span', b:parent, c:'›', d:{style:'color:rgba(0,0,0,0.4); font-size:15px;'}})
	})
	
	// Klik di luar = tutup
	setTimeout(() => {
		document.addEventListener('click', closeDropdown, {once: true})
	}, 0)
}
//======================================================================
// end of Script Loader
//======================================================================

//======================================================================
// Trading History
//======================================================================
const fillHist = (parent, data) => {
	parent.innerHTML = ''
	const table = el({a:'table', b:parent, d:{class:'trading-history'} })
	
	const header = el({a:'tr', b:el({a:'thead', b:table}) })
	el({a:'th', b:header, c:'No'})
	el({a:'th', b:header, c:'Id'})
	el({a:'th', b:header, c:'Side'})
	el({a:'th', b:header, c:'Qty'})
	el({a:'th', b:header, c:'Status'})
	el({a:'th', b:header, c:'TP'})
	el({a:'th', b:header, c:'SL'})
	el({a:'th', b:header, c:'Entry Time'})
	el({a:'th', b:header, c:'Entry Price'})
	el({a:'th', b:header, c:'Exit Time'})
	el({a:'th', b:header, c:'Exit Price'})
	el({a:'th', b:header, c:'PnL'})
	el({a:'th', b:header, c:'grossPnL'})
	el({a:'th', b:header, c:'fee'})
	el({a:'th', b:header, c:'Total'})
	el({a:'th', b:header, c:'Reason'})
	el({a:'th', b:header, c:'Comment'})
	
	el({a:'tbody', b:table})
	let total = 0
	data.forEach((a,b) => {
		const tr = el({a:'tr', b:table.children[1] })
		el({a:'td', b:tr, c:`${b+1}`})
		
		el({a:'td', b:tr, c:a.id })
		if (a.side === 'BUY') {
			el({a:'td', b:tr, c:'⮝', d:{style:'color:green;'} })
		} else if (a.side === 'SELL') {
			el({a:'td', b:tr, c:'⮟', d:{style:'color:red;'} })
		} else {
			el({a:'td', b:tr, c:'?' })
		}
		
		el({a:'td', b:tr, c:a.qty })
		el({a:'td', b:tr, c:a.status })
		el({a:'td', b:tr, c:a.tp })
		el({a:'td', b:tr, c:a.sl })
		
		el({a:'td', b:tr, c:a.entryTime })
		el({a:'td', b:tr, c:a.entryPrice })
		el({a:'td', b:tr, c:a.exitTime })
		el({a:'td', b:tr, c:a.exitPrice })
		
		el({a:'td', b:tr, c:a.pnl.toFixed(2) })
		el({a:'td', b:tr, c:a.grossPnL.toFixed(2) })
		el({a:'td', b:tr, c:a.fee.toFixed(2) })
		total += a.pnl
		el({a:'td', b:tr, c:total.toFixed(2) })
		
		el({a:'td', b:tr, c:a.reason })
		el({a:'td', b:tr, c:a.comment })
		
	})
}
//======================================================================
// end of Trading History
//======================================================================

//======================================================================
// Trading Stats
//======================================================================
const fillStats = (parent, data) => {
	const createBox = (title, value) => {
		const a = el({a:'div', b:parent, d:{style: `
			border:1px solid rgba(0,0,0,0.15);
			border-radius:7px;
			box-shadow:0 4px 16px rgba(0,0,0,0.12);
			margin: 7px;
			padding: 9px;
		`}})
		el({a:'div', b:a, c:title})
		el({a:'div', b:a, c:value})
	}
	parent.innerHTML = ''
	
	createBox('Final Balance', data.finalBalance)
	createBox('Total P&L', data.pnl)
	createBox('Win Rate', data.winRate)
	createBox('Total Trades', data.history.length) // data.history.length data.positions.length
	
}
//======================================================================
// end of Trading Stats
//======================================================================

const newEngine = a => {
	
	//==================================================================
	// Result window (chart / trading stats / trading history)
	//==================================================================
	const ct = dlg({title:''}).parentElement
	ct.style = `top:${71 + (11*document.body.children.length)}px; left:${103 + (11*document.body.children.length)}px`
	ct.className = 'pop1'
	ct.children[0].style = ''
	ct.children[0].textContent = ''
	el({a:'div', b:ct.children[0]})
	el({a:'div', b:ct.children[0], c:'Chart'})
	el({a:'div', b:ct.children[0], d:{class:'fa fa-close'}, e:{click: b => {
		ct.remove()
	} }})
	ct.children[1].remove()
	ct.children[1].style = ''
	el({a:'div', b:ct.children[1], d:{style:'padding-bottom:0;'} })
	el({a:'div', b:ct.children[1].children[0], d:{style:'padding:0;'}})
	const iframe = el({a:'iframe', b:el({a:'div', b:ct.children[1], d:{style:'display:flex; margin:0; padding:0; overflow:auto; resize:none; width:70vw; height:70vh;'}}) })
	const tradingStat = el({a:'div', d:{style:`
		display:flex;
	`}})
	const tradingHist = el({a:'div'})
	const tabBar = el({a:'div', b:ct.children[1].children[0].children[0], d:{style:'display:flex; border-bottom:0.5px solid rgba(0,0,0,0.1);'}})
	const tabs = [
		{label:'Chart',				panel: iframe		},
		{label:'Trading Stats',		panel: tradingStat	},
		{label:'Trading History',	panel: tradingHist	},
	]
	const switchTab = tab => {
		const lastActive = [...tabBar.children].find(t => t.classList.contains('active'))
		if (lastActive === tab) return
		lastActive.classList.remove('active')
		lastActive.style.borderBottomColor = 'transparent'
		lastActive.style.color = 'rgba(0,0,0,0.45)'
		tab.classList.add('active')
		tab.style.borderBottomColor = 'var(--text,#333)'
		tab.style.color = 'inherit'
		ct.children[1].children[1].children[0].remove()
		ct.children[1].children[1].appendChild(tabs[+tab.getAttribute('data-index')].panel)
	}
	tabs.forEach((tab, i) => {
		el({a:'div', b:tabBar, c:tab.label, d:{
			class: i === 0 ? 'tab-nav active' : 'tab-nav',
			'data-index': `${i}`,
			style:`padding:7px 14px; font-size:12px; font-weight:500; cursor:pointer;
			border-bottom:2px solid ${i===0 ? 'var(--text,#333)' : 'transparent'};
			color:${i===0 ? 'inherit' : 'rgba(0,0,0,0.45)'};
			user-select:none; white-space:nowrap;`
		}, e:{click: a => switchTab(a.target)}})
	})
	iframe.onload = () => {
		iframe.contentWindow.fillStats = data => {
			data.pnl = data.history.reduce((a,b)=>a+b.pnl,0).toFixed(2) // we need refactor engine getStats
			fillStats(tradingStat, data)
			fillHist(tradingHist, data.history)
		}
		iframe.contentWindow.fillHist = fillHist
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
		((a,b,c) => a.contains(b) ? a.replace(b, c) : a.replace(c, b) )(b.target.classList, 'fa-caret-down', 'fa-caret-right')
		a.children[1].classList.toggle('hide')
	} }})
	el({a:'div', b:a.children[0], c:'Trading Sistem'})
	el({a:'div', b:a.children[0], d:{class:'fa fa-close'}, e:{click: b => {
		a.remove()
	} }})
	a.children[1].remove()
	a.children[1].style = ''
	
	const b = el({a:'div', b:a.children[1]})
	el({a:'div', b:b })
	el({a:'button', b:b.children[0], c:'data' })
	// choose data from github ar provide own data
	// if choose data from github, choose timeframe and data range
	el({a:'button', b:b.children[0], c:'Load Script', e:{
		click: a => {
			a.stopPropagation()
			buildDropdown(a.target, codemirror)
		}
	}})
	
	el({a:'div', b:b })
	el({a:'div', b:b, c:'Run', e:{click: b => {
		document.body.appendChild(ct)
		iframe.srcdoc = createPage(codemirror.getValue())
	}} })
	
	const text = el({a:'textarea', b:el({a:'div', b:a.children[1]}) })
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
	
	//sendOrder(side("BUY" | "SELL"), qty, params = {tp: , sl: , comment:}) return orderId
	//modifyOrder(orderId, newTp, newSl)
	//closeOrder(id)
}
`
	const codemirror = CodeMirror.fromTextArea(text, {lineNumbers: true, mode: 'javascript', })
	el({a:'a', b:a.children[1], c:'powered by CodeMirror', d:{href:'https://codemirror.net/', style:'text-align:right;padding:0 21px;'}})
	
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
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
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
	initBacktestEngine = (initialBalance = 1000, feePercent = 0, slippagePoint = 0) => { engine = new BacktestEngine(initialBalance, feePercent, slippagePoint) }
	
	addChart = params => {
		if (engine) engine.addChart(params)
		else pendingCharts.push(params)
	}
	sendOrder = (side, qty, params) => { engine.sendOrder(side, currentCandle.c, qty, currentCandle.t, params) }
	modifyOrder = (id, newTp, newSl) =>  { engine.modifyOrder(id, newTp, newSl) }
	closeOrder = id => { engine.closeOrder(id, currentCandle.c, currentCandle.t) }
	
	//const trade = []
	
	onInit()
	
	if (!engine) {
		engine = new BacktestEngine(1000, 0, 0)
		pendingCharts.forEach(p => engine.addChart(p))  // flush setelah engine siap
		pendingCharts.length = 0
	}
	
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