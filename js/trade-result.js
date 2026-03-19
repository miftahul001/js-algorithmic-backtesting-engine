const showTrade = trade => {
	let a = document.getElementById('trade-panel')
	if (!a) {
		a = el({a:'div', b:document.body, d:{id:'trade-panel', style:'background:rgba(255,255,255,0.5); border-radius:7px; box-shadow:0 0 11px 3px rgba(0,0,0,0.1); position:fixed; top:55px; left:55px; margin:0; padding:9px;'} })
		mmv1(a)
	}
	a.innerHTML = ''
	
	a = el({a:'div', b:a, d:{style:'background:rgba(0,0,0,0.9); border-radius:5px; color:white; font-size:15px; font-weight:bold; padding:13px; display:flex;'} })
	el({a:'strong', b:a, c:'Trade', d:{style:'flex:1 1 auto; text-align:center;'} })
	el({a:'button', b:a, c:'X', e:{mousedown:a=>{a.stopPropagation()}, click:a=>{a.target.parentElement.parentElement.remove()} } })
	
	a = el({a:'div', b:a.parentElement, d:{style:'background:rgba(255,255,255,0.9); padding:9px; min-width:300px; min-height:150px; max-height:60vh; max-width:80vw; resize:both; overflow:scroll;'}, e:{mousedown:a=>{a.stopPropagation()}} })
	
	a = el({a:'table', b:a})
	
	el({a:'tr', b:el({a:'thead', b:a}) })
	el({a:'th', b:a.children[0].children[0], c:'No'})
	el({a:'th', b:a.children[0].children[0], c:'Id'})
	el({a:'th', b:a.children[0].children[0], c:'Side'})
	el({a:'th', b:a.children[0].children[0], c:'Qty'})
	el({a:'th', b:a.children[0].children[0], c:'Status'})
	el({a:'th', b:a.children[0].children[0], c:'TP'})
	el({a:'th', b:a.children[0].children[0], c:'SL'})
	el({a:'th', b:a.children[0].children[0], c:'Entry Time'})
	el({a:'th', b:a.children[0].children[0], c:'Entry Price'})
	el({a:'th', b:a.children[0].children[0], c:'Exit Time'})
	el({a:'th', b:a.children[0].children[0], c:'Exit Price'})
	el({a:'th', b:a.children[0].children[0], c:'PnL'})
	el({a:'th', b:a.children[0].children[0], c:'grossPnL'})
	el({a:'th', b:a.children[0].children[0], c:'fee'})
	el({a:'th', b:a.children[0].children[0], c:'Total'})
	el({a:'th', b:a.children[0].children[0], c:'Reason'})
	el({a:'th', b:a.children[0].children[0], c:'Comment'})
	
	a = el({a:'tbody', b:a})
	let total = 0
	trade.forEach((b,c) => {
		const tr = el({a:'tr', b:a })
		el({a:'td', b:tr, c:`${c+1}`})
		
		el({a:'td', b:tr, c:b.id })
		if (b.side === 'BUY') {
			el({a:'td', b:tr, c:'⮝', d:{style:'color:green;'} })
		} else if (b.side === 'SELL') {
			el({a:'td', b:tr, c:'⮟', d:{style:'color:red;'} })
		} else {
			el({a:'td', b:tr, c:'?' })
		}
		
		el({a:'td', b:tr, c:b.qty })
		el({a:'td', b:tr, c:b.status })
		el({a:'td', b:tr, c:b.tp })
		el({a:'td', b:tr, c:b.sl })
		
		el({a:'td', b:tr, c:b.entryTime })
		el({a:'td', b:tr, c:b.entryPrice })
		el({a:'td', b:tr, c:b.exitTime })
		el({a:'td', b:tr, c:b.exitPrice })
		
		el({a:'td', b:tr, c:b.pnl.toFixed(2) })
		el({a:'td', b:tr, c:b.grossPnL.toFixed(2) })
		el({a:'td', b:tr, c:b.fee.toFixed(2) })
		total += b.pnl
		el({a:'td', b:tr, c:total.toFixed(2) })
		
		el({a:'td', b:tr, c:b.reason })
		el({a:'td', b:tr, c:b.comment })
		
	})
}
