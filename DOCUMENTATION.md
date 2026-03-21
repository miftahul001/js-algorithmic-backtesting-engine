# JS Algorithmic Backtesting Engine — Documentation

> A browser-based, event-driven backtesting framework for cryptocurrency trading strategies.  
> Write your strategy in JavaScript. The engine handles simulation, fee calculation, and charting.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Dependencies](#2-dependencies)
3. [Getting Started](#3-getting-started)
4. [Writing a Strategy](#4-writing-a-strategy)
5. [API Reference — `abe`](#5-api-reference--abe)
   - [abe.createBacktestEngine()](#abecreatebacktestengine)
   - [abe.backtestEngine.sendOrder()](#abebacktestenginesendorder)
   - [abe.backtestEngine.modifyOrder()](#abebacktestenginemodifyorder)
   - [abe.backtestEngine.closeOrder()](#abebacktestenginescloseorder)
   - [abe.backtestEngine.getStats()](#abebacktestenginegetstats)
   - [abe.addChart()](#abeaddchart)
   - [abe.showTrade()](#abeshowTrade)
   - [abe.loadData()](#abeloaddata)
6. [Candle Object Reference](#6-candle-object-reference)
7. [abe.addChart() — ECharts Series Reference](#7-abeaddchart--echarts-series-reference)
8. [Chart Layout](#8-chart-layout)
9. [Complete Strategy Example](#9-complete-strategy-example)

---

## 1. Architecture Overview

```
index.html
│
├── js/m.js               — DOM helper (el, dlg)
├── js/js.js              — UI layer: creates editor panel & chart window
│
└── iframe (sandboxed execution)
    ├── js/echarts.min.js       — charting library
    ├── js/chartOption-v01.js   — chart config + abe.addChart / abe.genChartSeries
    ├── js/dataLoader.js        — abe.loadData (fetches local JSON candle data)
    ├── js/backtest-v01.js      — abe.createBacktestEngine (core simulation)
    ├── js/trade-result.js      — abe.showTrade (trade log table)
    └── [your strategy code]    — onInit() + onTick(candle)
```

**Key design decision:** your strategy runs inside a sandboxed `<iframe>` so it cannot affect the main UI. The iframe is re-generated fresh on every **Run**.

**Execution flow:**
```
onInit()  →  loadData()  →  forEach candle: backtestEngine.update(candle) → onTick(candle)
                                                     ↓
                                            checkExitConditions (TP/SL)
                                            updateEquity (floating P&L)
```

---

## 2. Dependencies

| Library | Source | Purpose |
|---------|--------|---------|
| `m.js` | `https://miftahul001.github.io/m/m.js` | DOM helper — `el()` and `dlg()` |
| `echarts.min.js` | local `js/` | Charting (candlestick, line, scatter) |
| `CodeMirror` | local `js/codemirror/` | Strategy code editor with JS syntax highlighting |
| `Font Awesome 4.7` | cdnjs | UI icons |

> `m.js` is a personal utility library. See [github.com/miftahul001/m](https://github.com/miftahul001/m) for documentation.

---

## 3. Getting Started

### Clone & Run

No build step required. This is a fully static browser app.

```bash
git clone https://github.com/miftahul001/js-algorithmic-backtesting-engine.git
cd js-algorithmic-backtesting-engine

# Serve locally (any static file server)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

> **Note:** Direct `file://` access will fail due to `fetch()` CORS restrictions when loading candle data. Always use a local server.

### Data File

By default, the engine loads candle data from:

```
data/30m/2025-01-01.json
```

See [abe.loadData()](#abeloaddata) for how to change the data source.

### Running Your First Backtest

1. Click **New** to open the strategy editor panel.
2. Write your strategy in the **onInit** and **onTick** functions.
3. Click **Run** — a chart window will open with the results.

---

## 4. Writing a Strategy

Every strategy must implement two functions:

```javascript
function onInit() {
    // Called once before the first candle.
    // Initialize indicators, buffers, and register chart series here.
}

function onTick(candle) {
    // Called once per candle, in chronological order.
    // candle = { t, o, h, l, c, v }
    // Place your indicator logic and order management here.
}
```

A global object `userData` is available for storing your strategy's state between ticks:

```javascript
function onInit() {
    userData.myBuffer = []
    userData.myValue = 0
}

function onTick(candle) {
    userData.myBuffer.push(candle.c)
    // ...
}
```

---

## 5. API Reference — `abe`

`abe` (Algorithmic Backtesting Engine) is the global namespace. All engine functions live under it.

---

### `abe.createBacktestEngine()`

Initializes the backtest engine. Call this inside `onInit()`.

```javascript
abe.createBacktestEngine(initialBalance, feePercent, slippagePoint)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialBalance` | `number` | Starting account balance (in quote currency, e.g. USDT) |
| `feePercent` | `number` | Trading fee as a percentage. E.g. `0.05` for 0.05% (Binance maker) |
| `slippagePoint` | `number` | Slippage in price units added/subtracted on entry |

After calling this, `abe.backtestEngine` becomes the active engine instance.

**Example:**
```javascript
function onInit() {
    abe.createBacktestEngine(1000, 0.05, 0.5)
    // Balance: 1000 USDT, fee: 0.05%, slippage: 0.5 price units
}
```

---

### `abe.backtestEngine.sendOrder()`

Opens a new position.

```javascript
const orderId = abe.backtestEngine.sendOrder(side, price, time, params)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `side` | `'BUY'` \| `'SELL'` | Yes | Direction of the trade |
| `price` | `number` | Yes | Intended entry price (slippage will be applied) |
| `time` | `number` | Yes | Timestamp of the candle triggering this order (use `candle.t`) |
| `params` | `object` | No | See below |

**`params` object:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `qty` | `number` | `1` | Position size (in base currency units) |
| `tp` | `number` | `null` | Take Profit price. Engine auto-closes when hit |
| `sl` | `number` | `null` | Stop Loss price. Engine auto-closes when hit |
| `comment` | `string` | `""` | Arbitrary label — appears in the trade log |

**Returns:** `orderId` (number) — use this to modify or close the position later.

**Slippage behavior:**
- `BUY`: actual entry = `price + slippagePoint`
- `SELL`: actual entry = `price - slippagePoint`

**Example:**
```javascript
function onTick(candle) {
    const id = abe.backtestEngine.sendOrder('BUY', candle.c, candle.t, {
        qty: 0.01,
        tp: candle.c * 1.02,   // +2%
        sl: candle.c * 0.99,   // -1%
        comment: 'MA crossover entry'
    })
}
```

---

### `abe.backtestEngine.modifyOrder()`

Modifies the TP or SL of an open position. Useful for trailing stops.

```javascript
abe.backtestEngine.modifyOrder({ id, newTp, newSl })
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | The `orderId` returned from `sendOrder()` |
| `newTp` | `number` | New Take Profit price |
| `newSl` | `number` | New Stop Loss price |

**Example — trailing stop:**
```javascript
function onTick(candle) {
    abe.backtestEngine.positions.forEach(pos => {
        if (pos.side === 'BUY') {
            const trailingStop = candle.h - userData.atrValue
            if (trailingStop > pos.sl) {
                abe.backtestEngine.modifyOrder({ id: pos.id, newSl: trailingStop })
            }
        }
    })
}
```

---

### `abe.backtestEngine.closeOrder()`

Manually closes an open position at a specific price.

```javascript
abe.backtestEngine.closeOrder(id, price, time)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | The `orderId` to close |
| `price` | `number` | Exit price |
| `time` | `number` | Exit timestamp (use `candle.t`) |

**Example:**
```javascript
abe.backtestEngine.closeOrder(myOrderId, candle.c, candle.t)
```

---

### `abe.backtestEngine.getStats()`

Returns a summary of the backtest results. Call after all candles are processed.

```javascript
const stats = abe.backtestEngine.getStats()
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `finalBalance` | `number` | Closing balance after all trades |
| `totalTrades` | `number` | Total number of closed trades |
| `winRate` | `string` | Win percentage, e.g. `"62.50%"` |
| `history` | `array` | Array of all closed trade objects (see below) |

**Trade history object:**

```javascript
{
    id: number,
    side: 'BUY' | 'SELL',
    entryPrice: number,
    entryTime: number,        // Unix timestamp ms
    exitPrice: number,
    exitTime: number,
    qty: number,
    tp: number | null,
    sl: number | null,
    status: 'CLOSED',
    reason: 'TP' | 'SL' | 'MANUAL_CLOSE',
    pnl: number,              // Net P&L after all fees
    grossPnL: number,         // P&L before fees
    fee: number,              // Total fee (entry + exit)
    comment: string
}
```

**Example:**
```javascript
// At end of onTick, after all candles, check console or display stats
const stats = abe.backtestEngine.getStats()
console.log('Win Rate:', stats.winRate)
console.log('Final Balance:', stats.finalBalance)
```

---

### `abe.addChart()`

Registers a chart series to be rendered after all candles are processed. Call this inside `onInit()`.

```javascript
abe.addChart(params)
```

`params` is a standard **ECharts series object** with one constraint: the `type` field controls how the engine routes it into the chart layout. See the full reference in [Section 7](#7-abeaddchart--echarts-series-reference).

---

### `abe.showTrade()`

Opens a floating, draggable trade log panel showing all closed trades in a table. Columns include: Side, Qty, Status, TP, SL, Entry/Exit Price & Time, PnL, Gross PnL, Fee, Running Total, Reason, and Comment.

```javascript
abe.showTrade()
```

> Note: `abe.showTrade()` reads from `abe.trade`, not `abe.backtestEngine.history`. Make sure to populate `abe.trade` with your closed trades if you use this function.

---

### `abe.loadData()`

Fetches candle data from the local JSON file. Called internally by the engine — override this function to load from a different source.

```javascript
const data = await abe.loadData()
```

**Default data source:** `data/30m/2025-01-01.json`

**Returns:** Array of candle objects. See [Section 6](#6-candle-object-reference).

**To change the data source**, override `abe.loadData` in your strategy's `onInit`:

```javascript
function onInit() {
    abe.loadData = async () => {
        const res = await fetch('data/H1/2025-06-01.json')
        return await res.json()
    }
}
```

---

## 6. Candle Object Reference

Each candle passed to `onTick(candle)` has the following structure, matching the Binance kline API format:

```javascript
{
    t: 1735689600000,    // Open time — Unix timestamp in milliseconds
    o: 94821.5,          // Open price
    h: 95100.0,          // High price
    l: 94600.3,          // Low price
    c: 94980.2,          // Close price
    v: 123.456           // Volume (base currency)
}
```

---

## 7. `abe.addChart()` — ECharts Series Reference

`abe.addChart(params)` accepts a standard ECharts series object. The `type` field determines how the series is placed in the chart.

### Routing by `type`

| `type` value | Placement | Notes |
|---|---|---|
| `'candlestick'` | Main chart (top grid) | Added automatically by the engine. Do not add manually. |
| `'line'` | Main chart (top grid) | Overlay on price, e.g. Moving Average |
| `'scatter'` | Main chart (top grid) | Signal markers, e.g. entry/exit dots |
| `'markLine'` | Merged into candlestick | Horizontal/vertical reference lines |
| `'markPoint'` | Merged into candlestick | Labels on specific candles |

> The second grid (bottom, for Grid Hit data) is pre-configured with `yAxisIndex: 1`. To plot on the bottom grid, set `xAxisIndex: 1, yAxisIndex: 1` on your series.

---

### `type: 'line'` — Overlay Indicator

Use for any continuous indicator drawn on top of the price chart: Moving Average, Bollinger Bands, ATR, etc.

```javascript
abe.addChart({
    name: 'Moving Average (14)',
    type: 'line',
    data: userData.maLine,          // Array populated in onTick — must be same length as candles
    smooth: false,
    symbol: 'none',                 // Hide dots on data points
    lineStyle: {
        color: '#f0c040',
        width: 1.5,
    },
    // Optional: link this series to the price axis
    xAxisIndex: 0,
    yAxisIndex: 0,
})
```

**Key rules for `line` data:**
- The `data` array must be the **same length** as the total candle count.
- For bars where your indicator is not yet calculated (e.g. warm-up period), push `null`:
  ```javascript
  userData.maLine.push(null)     // before enough data
  userData.maLine.push(maValue)  // after enough data
  ```

---

### `type: 'scatter'` — Signal Markers

Use for discrete events: entry signals, detected swing points, divergence markers.

```javascript
// Register in onInit
userData.signals = []
abe.addChart({
    name: 'Buy Signals',
    type: 'scatter',
    data: userData.signals,
    symbol: 'triangle',
    symbolSize: 12,
    itemStyle: { color: '#51ff51' },
    xAxisIndex: 0,
    yAxisIndex: 0,
})

// Push in onTick (value format: [xAxisIndex, yPrice])
function onTick(candle) {
    // ...
    userData.signals.push([userData.signals.length + userData.maLine.length, candle.l * 0.999])
}
```

> **Note:** For `scatter`, `data` is an array of `[xIndex, yValue]` pairs where `xIndex` is the candle's position in the `xAxis` array.

---

### `type: 'markLine'` — Reference Lines

Draws horizontal or vertical lines directly on the candlestick series. Useful for support/resistance levels or entry price lines.

```javascript
// Register in onInit
userData.levels = []
abe.addChart({
    type: 'markLine',
    data: userData.levels,
})

// Push a horizontal line in onTick
userData.levels.push({
    yAxis: 95000,
    label: { formatter: 'Resistance' },
    lineStyle: { color: '#ff5151', type: 'dashed' }
})
```

---

### `type: 'markPoint'` — Candle Labels

Pins a labeled marker to a specific candle. Useful for annotating TP/SL hits or pattern labels.

```javascript
userData.points = []
abe.addChart({
    type: 'markPoint',
    data: userData.points,
})

// Push a point in onTick
userData.points.push({
    coord: [xAxisIndex, candle.h],   // [x position, y price]
    value: 'Peak',
    itemStyle: { color: '#ff9900' }
})
```

---

## 8. Chart Layout

The chart uses two grids, pre-configured in `chartOption-v01.js`:

```
┌────────────────────────────────────────┐
│  Grid 0 — Price Chart (65% height)     │
│  Candlestick + line + scatter overlays │
│  yAxisIndex: 0, xAxisIndex: 0          │
├────────────────────────────────────────┤
│  Grid 1 — Sub Chart (20% height)       │
│  Bar distribution / custom indicators  │
│  yAxisIndex: 1, xAxisIndex: 1          │
└────────────────────────────────────────┘
│  DataZoom slider                        │
└────────────────────────────────────────┘
```

Default zoom: first 100 candles. Scroll to zoom, drag to pan. Both grids are linked.

---

## 9. Complete Strategy Example

A Moving Average crossover strategy with full chart annotation.

```javascript
function onInit() {
    abe.createBacktestEngine(1000, 0.05, 0.5)

    userData.fastPeriod = 9
    userData.slowPeriod = 21
    userData.fastBuf = []
    userData.slowBuf = []
    userData.fastSum = 0
    userData.slowSum = 0
    userData.fastLine = []
    userData.slowLine = []
    userData.buySignals = []
    userData.sellSignals = []

    abe.addChart({
        name: 'Fast MA (9)',
        type: 'line',
        data: userData.fastLine,
        symbol: 'none',
        lineStyle: { color: '#51ff51', width: 1 },
        xAxisIndex: 0,
        yAxisIndex: 0,
    })

    abe.addChart({
        name: 'Slow MA (21)',
        type: 'line',
        data: userData.slowLine,
        symbol: 'none',
        lineStyle: { color: '#ff5151', width: 1 },
        xAxisIndex: 0,
        yAxisIndex: 0,
    })

    abe.addChart({
        name: 'Buy',
        type: 'scatter',
        data: userData.buySignals,
        symbol: 'triangle',
        symbolSize: 10,
        itemStyle: { color: '#51ff51' },
        xAxisIndex: 0,
        yAxisIndex: 0,
    })

    abe.addChart({
        name: 'Sell',
        type: 'scatter',
        data: userData.sellSignals,
        symbol: 'triangleDown',
        symbolSize: 10,
        itemStyle: { color: '#ff5151' },
        xAxisIndex: 0,
        yAxisIndex: 0,
    })
}

function onTick(candle) {
    // Update fast MA
    userData.fastBuf.push(candle.c)
    userData.fastSum += candle.c
    if (userData.fastBuf.length > userData.fastPeriod) {
        userData.fastSum -= userData.fastBuf.shift()
    }
    const fast = userData.fastBuf.length === userData.fastPeriod
        ? userData.fastSum / userData.fastPeriod
        : null
    userData.fastLine.push(fast)

    // Update slow MA
    userData.slowBuf.push(candle.c)
    userData.slowSum += candle.c
    if (userData.slowBuf.length > userData.slowPeriod) {
        userData.slowSum -= userData.slowBuf.shift()
    }
    const slow = userData.slowBuf.length === userData.slowPeriod
        ? userData.slowSum / userData.slowPeriod
        : null
    userData.slowLine.push(slow)

    if (!fast || !slow) return

    const prevFast = userData.fastLine[userData.fastLine.length - 2]
    const prevSlow = userData.slowLine[userData.slowLine.length - 2]
    if (!prevFast || !prevSlow) return

    const idx = userData.fastLine.length - 1
    const openPositions = abe.backtestEngine.positions.length

    // Golden Cross — BUY
    if (prevFast <= prevSlow && fast > slow && openPositions === 0) {
        abe.backtestEngine.sendOrder('BUY', candle.c, candle.t, {
            qty: 0.01,
            tp: candle.c * 1.03,
            sl: candle.c * 0.98,
            comment: 'Golden Cross'
        })
        userData.buySignals.push([idx, candle.l * 0.9995])
    }

    // Death Cross — SELL / close BUY
    if (prevFast >= prevSlow && fast < slow && openPositions > 0) {
        abe.backtestEngine.positions.forEach(pos => {
            if (pos.side === 'BUY') {
                abe.backtestEngine.closeOrder(pos.id, candle.c, candle.t)
            }
        })
        userData.sellSignals.push([idx, candle.h * 1.0005])
    }
}
```

---

*Documentation generated from source: `backtest-v01.js`, `chartOption-v01.js`, `dataLoader.js`, `trade-result.js`, `js.js`*
