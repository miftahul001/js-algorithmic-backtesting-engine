window.abe = window.abe || {}

abe.createCandlestick = (data, markLine, markPoint) =>(
	{ // Candlestick Series
		type: 'candlestick',
		data: data,
		zlevel: 1,
		xAxisIndex: 0,
		yAxisIndex: 0,
		itemStyle: {
			color: '#51ff51',//upColor,
			color0: '#ff5151',//downColor,
			borderColor: '#51ff51',//upBorderColor,
			borderColor0: '#ff5151',//downBorderColor
			opacity: 0.5,
		},
		markLine: {
			data: markLine || []
		},
		markPoint: {
			data: markPoint || []
		},
	}
)

abe.createLine = (name, data, yAxisIndex, color, opacity, width) =>(
	{
		name: name,
		type: 'line',
		data: data || [],
		xAxisIndex: 0,
		yAxisIndex: yAxisIndex || 0,
		showSymbol: false,
		lineStyle: {
			color: color,
			opacity: opacity,
			width: width
		}
	}
)

abe.createScatter = (name, data, symbol, color, borderColor) =>(
	{
		name: name,
		type: 'scatter',
		data: data || [],
		xAxisIndex: 0,
		yAxisIndex: 0,
		//zlevel: 2,
		//silent: true,
		symbol: symbol,
		//symbolRotate: 180,
		//symbolSize: 14,
		itemStyle: {
			color: color,
			borderColor: borderColor,
			//borderWidth: 1.5
		}
	}
)

//const createFloatingBar = (barBaseData, barSpanData) => (
abe.createBarBaseData = barBaseData => (
	// --- Series Grafik Bawah (Floating Bar) ---
	{
		name: 'Base Bar (Hidden)',
		type: 'bar',
		xAxisIndex: 1,
		yAxisIndex: 1,
		stack: 'GridRange',
		itemStyle: { color: 'rgba(0,0,0,0)' }, // Buat tidak terlihat
		data: barBaseData
	}
)

abe.createBarSpanData = barSpanData => (
	{
		name: 'Grid Active Span',
		type: 'bar',
		xAxisIndex: 1,
		yAxisIndex: 1,
		stack: 'GridRange',
		itemStyle: { 
			color: '#5470C6',
			//borderRadius: [2, 2, 2, 2] // Opsional: Estetika rounded corner
		},
		data: barSpanData
	}
)

abe.getGridIndex = (price, resistance, support, gridSize) => {
	if (price < support) return 1
	if (price >= resistance) return 12
	return Math.floor((price - support) / gridSize) + 2
}
