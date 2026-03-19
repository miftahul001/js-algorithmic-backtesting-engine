window.abe = window.abe || {}

abe.createChartOption = (xAxis, series) => ({
	animation: false,
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'cross' },
		position: (pos, params, el, elRect, size) => pos[0] < size.viewSize[0] / 2 ? ({top:10, right:30}) : ({top:10, left:30}),
	},
	axisPointer: { link: { xAxisIndex: 'all' }, },
	dataZoom: [
		{ type: 'inside', xAxisIndex: [0, 1], startValue: 0, endValue: 100 },
		{ type: 'slider', xAxisIndex: [0, 1], bottom: '2%', startValue: 0, endValue: 100 }
	],
	// Membagi Ruang (Spatial Disparity) menjadi 2 Grafik
	grid: [
		{ left: '8%', right: '8%', top: '5%', height: '65%' },    // Grafik OHLC (Atas)
		{ left: '8%', right: '8%', top: '71%', height: '20%' }    // Grafik Sebaran Bar (Bawah)
	],
	xAxis: [
		{ 
			type: 'category', 
			data: xAxis, 
			gridIndex: 0, 
			boundaryGap: true, 
			axisLabel: { show: false }, // Sembunyikan label waktu di grafik atas agar rapi
			axisTick: { show: false },
			axisPointer: { 
				label: { 
					show: false // KUNCI: Mematikan kotak tooltip tanggal/waktu di sumbu X atas
				}
			}			
		},
		{ 
			type: 'category', 
			data: xAxis, 
			gridIndex: 1, 
			boundaryGap: true 
		}
	],
	yAxis: [
		{ 
			type: 'value', 
			gridIndex: 0, 
			scale: true, // Sumbu harga OHLC otomatis 
			name: 'Price'
		},
		{ 
			type: 'value', 
			gridIndex: 1, 
			min: 0, 
			max: 13, // Margin ekstra untuk ruang visual
			interval: 1,
			name: 'Grid Hit',
			axisLabel: {
				formatter: function(value) {
					// Kustomisasi label agar mudah dipahami secara manusiawi
					if (value === 1) return '< S (1)';
					if (value === 2) return 'Supp (2)';
					if (value === 11) return 'Res (11)';
					if (value === 12) return '> R (12)';
					if (value > 2 && value < 11) return 'G ' + value;
					return '';
				}
			},
			splitLine: { show: true }
		}
	],
	series: series,
})
