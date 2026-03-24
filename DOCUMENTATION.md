# 📚 API Documentation: JS Algorithmic Backtesting Engine

This documentation explains the built-in functions available within the in-browser editor for building and testing your algorithmic trading strategies (EAs) or custom indicators.

---

## 1. Script Lifecycle

Every strategy script must implement the following two core functions to be recognized and executed by the backtest engine.

### `onInit()`
This function is called **only once** when the backtest is initialized. Use this function to set up the engine's initial configuration and register indicator charts.

### `onTick(candle)`
This function is called **repeatedly** every time a new bar/candlestick is fed from the historical data. Your core strategy logic (indicator calculation, signal generation, and order execution) must reside here.
* **`candle` Parameter (Object):** Represents the price data for the current time period.
	* `candle.o` : Open price
	* `candle.h` : High price
	* `candle.l` : Low price
	* `candle.c` : Close price
	* `candle.t` : Timestamp (Time)

---

## 2. Engine Setup & Visualization

These functions are typically called inside the `onInit()` block.

### `initBacktestEngine(initialBalance, feePercent, slippagePoint)`
Initializes the starting balance and simulates real-world market conditions.
* `initialBalance` (Number): The starting account balance (e.g., `1000`).
* `feePercent` (Number): The transaction fee percentage per trade (e.g., `0.05` for 0.05%).
* `slippagePoint` (Number): The price slippage tolerance in points (e.g., `0`).

### `addChart(params)`
Registers an indicator chart (such as a Moving Average line) to the lower visualization panel (Spatial Disparity grid).
* `params` (Object): An Apache ECharts-based configuration object.
	* `name` (String): The name of the indicator.
	* `type` (String): The chart type (e.g., `'line'`).
	* `data` (Array): The array holding the indicator values, which is updated inside `onTick()`.

---

## 3. Trading Execution API (Order Management)

These functions are used inside the `onTick()` block to open, modify, or close positions.

### `sendOrder(side, qty, params)`
Sends a command to open a new trading position.
* `side` (String): The trade direction, must be either `'BUY'` or `'SELL'`.
* `qty` (Number): The quantity of the asset to trade.
* `params` (Object): *Optional*. Additional order configurations.
	* `tp` (Number): Take Profit price.
	* `sl` (Number): Stop Loss price.
	* `comment` (String): A custom note or tag for this order.
* **Returns:** An `orderId` (Number) that can be used for future modifications.

### `modifyOrder(orderId, newTp, newSl)`
Modifies the Take Profit or Stop Loss of an active order (highly useful for Trailing Stop logic).
* `orderId` (Number): The ID of the order you wish to modify.
* `newTp` (Number/null): The new Take Profit price. Pass `null` if you do not want to change it.
* `newSl` (Number/null): The new Stop Loss price. Pass `null` if you do not want to change it.

### `closeOrder(id)`
Manually closes an active position at the current bar's closing price.
* `id` (Number): The ID of the order you wish to close.

---

## 💡 Complete Strategy Example

Below is a foundational example of an Expert Advisor (EA) that trades based on a Moving Average crossover:

```javascript
const maPeriod = 14;
const maBuffer = [];
const maLine = [];
let maSum = 0;
let currentOrderId = null;

function onInit() {
	// Initialize the engine with $1000 balance, 0.05% fee, and 0 slippage
	initBacktestEngine(1000, 0.05, 0);

	// Register the MA chart
	addChart({
		name: 'SMA 14',
		type: 'line',
		data: maLine,
	});
}

function onTick(candle) {
	// 1. Indicator Calculation
	maBuffer.push(candle.c);
	maSum += candle.c;
	
	let currentMa = null;
	if (maBuffer.length === maPeriod) {
		currentMa = maSum / maPeriod;
		maLine.push(currentMa);
		maSum -= maBuffer.shift();
	} else {
		maLine.push(null);
	}

	// 2. Trading Logic (Execute only if MA is fully formed)
	if (currentMa !== null) {
		// Example: Buy if the close price crosses above the MA
		if (candle.c > currentMa && !currentOrderId) {
			currentOrderId = sendOrder('BUY', 1, {
				tp: candle.c + 50,
				sl: candle.c - 20,
				comment: 'MA Crossover Buy'
			});
		}
	}
}
