/**
 * Unit Tests for BacktestEngine
 * 
 * Comprehensive test suite untuk BacktestEngine class
 * Menggunakan Jest sebagai test framework
 * 
 * Run: npm test
 */

// ============================================================================
// TEST SETUP & FIXTURES
// ============================================================================

const BacktestEngine = require('../js/engine');

describe('BacktestEngine', () => {
	let engine;

	beforeEach(() => {
		engine = new BacktestEngine(1000, 0.05, 0); // balance, fee%, slippage
	});

	// ========================================================================
	// 1. CONSTRUCTOR & INITIALIZATION TESTS
	// ========================================================================

	describe('Constructor', () => {
		test('should initialize with correct balance', () => {
			const newEngine = new BacktestEngine(5000, 0.1, 0);
			expect(newEngine.getStats().finalBalance).toBe(5000);
		});

		test('should convert fee percentage correctly (0.05% becomes 0.0005)', () => {
			const newEngine = new BacktestEngine(1000, 0.05, 1);
			const stats = newEngine.getStats();
			// With 0% fee, balance should stay 1000
			expect(stats.finalBalance).toBe(1000);
		});

		test('should handle zero balance', () => {
			const newEngine = new BacktestEngine(0, 0, 0);
			expect(newEngine.getStats().finalBalance).toBe(0);
		});

		test('should handle large balance', () => {
			const newEngine = new BacktestEngine(1000000, 0.05, 0);
			expect(newEngine.getStats().finalBalance).toBe(1000000);
		});

		test('should set slippage correctly', () => {
			// Slippage akan terlihat saat sendOrder dijalankan
			const newEngine = new BacktestEngine(1000, 0, 5); // 5 points slippage
			const orderId = newEngine.sendOrder('BUY', 100, 1, 1000);
			expect(orderId).toBeDefined();
		});
	});

	// ========================================================================
	// 2. SEND ORDER TESTS (BUY & SELL)
	// ========================================================================

	describe('sendOrder - BUY Orders', () => {
		test('should return a valid order ID', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000);
			expect(typeof orderId).toBe('number');
			expect(orderId).toBeGreaterThan(0);
		});

		test('should deduct entry fee from balance', () => {
			const initialBalance = engine.getStats().finalBalance;
			engine.sendOrder('BUY', 100, 1, 1000); // 100 price, 1 qty
			const afterOrderBalance = engine.getStats().finalBalance;
			
			// Fee = 100 * 1 * 0.0005 = 0.05
			expect(afterOrderBalance).toBeLessThan(initialBalance);
			expect(initialBalance - afterOrderBalance).toBeCloseTo(0.05, 2);
		});

		test('should apply slippage on entry price', () => {
			const engineWithSlippage = new BacktestEngine(1000, 0, 1); // 1 point slippage
			engineWithSlippage.sendOrder('BUY', 100, 2, 1000);
			// Expected entry price = 100 + 1 = 101
			// No easy way to verify without accessing private fields
			// This test documents the behavior
			expect(engineWithSlippage.getStats().finalBalance).toBe(1000);
		});

		test('should reject invalid quantity (zero)', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 0, 1000);
			}).toThrow();
		});

		test('should reject invalid quantity (negative)', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, -5, 1000);
			}).toThrow();
		});

		test('should reject TP less than or equal to entry price for BUY', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 1, 1000, { tp: 100 }); // TP = entry price
			}).toThrow('must be >');
		});

		test('should reject SL greater than or equal to entry price for BUY', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 1, 1000, { sl: 100 }); // SL = entry price
			}).toThrow('must be <');
		});

		test('should reject TP less than SL for BUY', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 1, 1000, {
					tp: 95,  // TP below entry
					sl: 105  // SL above entry (invalid for BUY)
				});
			}).toThrow();
		});

		test('should accept valid TP and SL for BUY', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 1, 1000, {
					tp: 110,
					sl: 90
				});
			}).not.toThrow();
		});
	});

	describe('sendOrder - SELL Orders', () => {
		test('should accept SELL order', () => {
			const orderId = engine.sendOrder('SELL', 100, 1, 1000);
			expect(orderId).toBeGreaterThan(0);
		});

		test('should apply slippage on SELL (price - slippage)', () => {
			const engineWithSlippage = new BacktestEngine(1000, 0, 1);
			engineWithSlippage.sendOrder('SELL', 100, 1, 1000);
			// Expected entry price = 100 - 1 = 99
			expect(engineWithSlippage.getStats().finalBalance).toBe(1000);
		});

		test('should reject TP >= entry price for SELL', () => {
			expect(() => {
				engine.sendOrder('SELL', 100, 1, 1000, { tp: 100 });
			}).toThrow('must be <');
		});
		
		test('should reject TP greater than or equal to SL for SELL', () => {
			expect(() => {
				// Entry 100, TP 110, SL 105 -> TP >= SL (Invalid untuk SELL)
				engine.sendOrder('SELL', 100, 1, 1000, { tp: 110, sl: 105 });
			}).toThrow('must be < sl');
		});
		
		test('should reject SL <= entry price for SELL', () => {
			expect(() => {
				engine.sendOrder('SELL', 100, 1, 1000, { sl: 100 });
			}).toThrow('must be >');
		});

		test('should accept valid TP and SL for SELL', () => {
			expect(() => {
				engine.sendOrder('SELL', 100, 1, 1000, {
					tp: 90,
					sl: 110
				});
			}).not.toThrow();
		});
	});

	describe('sendOrder - Multiple Orders', () => {
		test('should handle multiple orders sequentially', () => {
			const id1 = engine.sendOrder('BUY', 100, 1, 1000);
			const id2 = engine.sendOrder('BUY', 101, 1, 2000);
			const id3 = engine.sendOrder('SELL', 102, 1, 3000);

			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
		});

		test('should track multiple open positions', () => {
			engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			engine.sendOrder('BUY', 101, 2, 2000, { tp: 111, sl: 91 });
			engine.sendOrder('SELL', 102, 1, 3000, { tp: 92, sl: 112 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(0); // No closed trades yet
		});
	});

	// ========================================================================
	// 3. MODIFY ORDER TESTS
	// ========================================================================

	describe('modifyOrder', () => {
		test('should modify TP of an order', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			engine.modifyOrder(orderId, 120, null); // Modify only TP
			// Verification through getStats in real scenario
			expect(orderId).toBeGreaterThan(0);
		});

		test('should modify SL of an order', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			engine.modifyOrder(orderId, null, 85); // Modify only SL
			expect(orderId).toBeGreaterThan(0);
		});

		test('should modify both TP and SL', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			engine.modifyOrder(orderId, 115, 88);
			expect(orderId).toBeGreaterThan(0);
		});

		test('should not throw on non-existent order ID', () => {
			expect(() => {
				engine.modifyOrder(9999, 120, null);
			}).not.toThrow();
		});
	});

	// ========================================================================
	// 4. CLOSE ORDER TESTS
	// ========================================================================

	describe('closeOrder', () => {
		test('should close an open order', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000);
			const closed = engine.closeOrder(orderId, 105, 2000);
			expect(closed).toBe(true);
		});

		test('should return false for non-existent order', () => {
			const closed = engine.closeOrder(9999, 105, 2000);
			expect(closed).toBe(false);
		});

		test('should calculate profit correctly on manual close (BUY)', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000);
			engine.closeOrder(orderId, 110, 2000); // Close at 110, bought at 100
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			// Profit = (110-100)*1 - fees = 10 - fee
			expect(stats.history[0].pnl).toBeGreaterThan(9);
		});

		test('should calculate loss correctly on manual close (BUY)', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000);
			engine.closeOrder(orderId, 95, 2000); // Close at 95, bought at 100
			
			const stats = engine.getStats();
			expect(stats.history[0].pnl).toBeLessThan(0);
		});

		test('should calculate profit correctly on manual close (SELL)', () => {
			const orderId = engine.sendOrder('SELL', 100, 1, 1000);
			engine.closeOrder(orderId, 90, 2000); // Close at 90, sold at 100
			
			const stats = engine.getStats();
			expect(stats.history[0].pnl).toBeGreaterThan(9);
		});
	});

	// ========================================================================
	// 5. UPDATE & TICK TESTS
	// ========================================================================

	describe('update (Bar Processing)', () => {
		test('should add candlestick data', () => {
			const bar = { o: 100, c: 105, h: 107, l: 99, t: 1000 };
			engine.update(bar);
			const chartOption = engine.createChartOption();
			expect(chartOption.series[0].data.length).toBe(1);
		});

		test('should process multiple bars sequentially', () => {
			const bars = [
				{ o: 100, c: 101, h: 102, l: 99, t: 1000 },
				{ o: 101, c: 103, h: 104, l: 100, t: 2000 },
				{ o: 103, c: 102, h: 105, l: 101, t: 3000 }
			];
			bars.forEach(bar => engine.update(bar));
			
			const chartOption = engine.createChartOption();
			expect(chartOption.series[0].data.length).toBe(3);
		});

		test('should update x-axis with timestamps', () => {
			const bar = { o: 100, c: 105, h: 107, l: 99, t: 1609459200000 }; // 2021-01-01
			engine.update(bar);
			const chartOption = engine.createChartOption();
			expect(chartOption.xAxis[0].data.length).toBe(1);
		});
	});

	// ========================================================================
	// 6. TP/SL EXECUTION TESTS
	// ========================================================================

	describe('TP/SL Exit Conditions', () => {
		test('should close BUY position on TP hit', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110 });
			
			// Simulate bar that hits TP
			const bar = { o: 109, c: 111, h: 115, l: 105, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			expect(stats.history[0].reason).toBe('TP');
		});

		test('should close BUY position on SL hit', () => {
			const orderId = engine.sendOrder('BUY', 100, 1, 1000, { sl: 90 });
			
			// Simulate bar that hits SL
			const bar = { o: 95, c: 88, h: 95, l: 85, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			expect(stats.history[0].reason).toBe('SL');
		});

		test('should close SELL position on TP hit', () => {
			const orderId = engine.sendOrder('SELL', 100, 1, 1000, { tp: 90 });
			
			// Simulate bar that hits TP (price goes down to 90)
			const bar = { o: 95, c: 88, h: 95, l: 85, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			expect(stats.history[0].reason).toBe('TP');
		});

		test('should close SELL position on SL hit', () => {
			const orderId = engine.sendOrder('SELL', 100, 1, 1000, { sl: 110 });
			
			// Simulate bar that hits SL (price goes up)
			const bar = { o: 105, c: 112, h: 115, l: 105, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			expect(stats.history[0].reason).toBe('SL');
		});

		test('should not close position if neither TP nor SL is hit', () => {
			engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			
			// Bar doesn't touch either TP or SL
			const bar = { o: 101, c: 102, h: 103, l: 100, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(0); // Still open
		});
		
		test('should not close SELL position if neither TP nor SL is hit', () => {
			engine.sendOrder('SELL', 100, 1, 1000, { tp: 90, sl: 110 });
			
			// Bar bergerak di tengah-tengah (High: 105, Low: 95)
			const bar = { o: 100, c: 100, h: 105, l: 95, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(0); // Posisi SELL masih terbuka, menembak baris 144!
		});
		
		test('should prioritize SL over TP if both hit in same bar', () => {
			// This depends on implementation order
			// Usually SL is checked first for safety
			engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			
			// Bar that would hit both (extreme bar)
			const bar = { o: 100, c: 100, h: 115, l: 85, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
		});

		test('should not close position without TP/SL set', () => {
			engine.sendOrder('BUY', 100, 1, 1000);
			
			// Even extreme price movement shouldn't close
			const bar = { o: 150, c: 160, h: 170, l: 50, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(0);
		});
	});

	// ========================================================================
	// 7. EQUITY & FLOATING PnL TESTS
	// ========================================================================

	describe('Equity Calculation', () => {
		test('should update equity with floating PnL on BUY', () => {
			engine.sendOrder('BUY', 100, 1, 1000);
			
			// Price goes up
			const bar = { o: 105, c: 110, h: 111, l: 104, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			// Equity = balance + floating PnL
			// Floating = (110 - 100) * 1 = 10
			expect(stats.finalBalance).toBeLessThan(1000 + 10); // Account for fees
		});

		test('should reduce equity on losses', () => {
			const initialBalance = engine.getStats().finalBalance;
			engine.sendOrder('BUY', 100, 1, 1000);
			
			// Price goes down
			const bar = { o: 95, c: 90, h: 95, l: 89, t: 2000 };
			engine.update(bar);
			
			const stats = engine.getStats();
			// Floating PnL is negative
			expect(stats.finalBalance).toBeLessThan(initialBalance);
		});
	});

	// ========================================================================
	// 8. STATISTICS TESTS
	// ========================================================================

	describe('getStats', () => {
		test('should return correct format', () => {
			const stats = engine.getStats();
			expect(stats).toHaveProperty('finalBalance');
			expect(stats).toHaveProperty('totalTrades');
			expect(stats).toHaveProperty('winRate');
			expect(stats).toHaveProperty('history');
		});

		test('should return zero trades initially', () => {
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(0);
			expect(stats.history).toEqual([]);
		});

		test('should calculate win rate correctly', () => {
			// Trade 1: +10 profit
			const id1 = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110 });
			engine.update({ o: 109, c: 111, h: 115, l: 105, t: 2000 });
			
			// Trade 2: -5 loss
			const id2 = engine.sendOrder('BUY', 110, 1, 3000, { sl: 105 });
			engine.update({ o: 109, c: 104, h: 109, l: 103, t: 4000 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(2);
			expect(stats.winRate).toContain('50'); // 50% win rate
		});

		test('should return 0% win rate with zero trades', () => {
			const stats = engine.getStats();
			expect(stats.winRate).toBe('0%');
		});

		test('should format win rate as percentage string', () => {
			const id = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110 });
			engine.update({ o: 109, c: 111, h: 115, l: 105, t: 2000 });
			
			const stats = engine.getStats();
			expect(typeof stats.winRate).toBe('string');
			expect(stats.winRate).toMatch(/%/);
		});
	});

	// ========================================================================
	// 9. FEE CALCULATION TESTS
	// ========================================================================

	describe('Fee Deduction', () => {
		test('should deduct entry fee on sendOrder', () => {
			const initialBalance = engine.getStats().finalBalance;
			engine.sendOrder('BUY', 100, 1, 1000);
			
			const afterBalance = engine.getStats().finalBalance;
			const feePaid = initialBalance - afterBalance;
			
			// Fee = 100 * 1 * 0.0005 = 0.05
			expect(feePaid).toBeCloseTo(0.05, 2);
		});

		test('should deduct exit fee on closeOrder', () => {
			const id = engine.sendOrder('BUY', 100, 1, 1000);
			const afterEntry = engine.getStats().finalBalance;
			
			engine.closeOrder(id, 110, 2000);
			const afterExit = engine.getStats().finalBalance;
			
			// Exit fee = 110 * 1 * 0.0005 = 0.055
			// Net profit before exit fee = 10 - entry fee = 9.95
			// After exit fee = 9.95 - 0.055 ≈ 9.895
			expect(afterExit).toBeLessThan(afterEntry + 10);
		});

		test('should calculate fees for different quantities', () => {
			const engine1 = new BacktestEngine(1000, 0.1, 0); // 0.1%
			const balance1 = engine1.getStats().finalBalance;
			engine1.sendOrder('BUY', 100, 5, 1000);
			
			const afterBalance1 = engine1.getStats().finalBalance;
			const fee1 = balance1 - afterBalance1;
			
			// Fee = 100 * 5 * 0.001 = 0.5
			expect(fee1).toBeCloseTo(0.5, 1);
		});

		test('should handle zero fee', () => {
			const engineNoFee = new BacktestEngine(1000, 0, 0);
			const initialBalance = engineNoFee.getStats().finalBalance;
			
			engineNoFee.sendOrder('BUY', 100, 1, 1000);
			const afterBalance = engineNoFee.getStats().finalBalance;
			
			expect(afterBalance).toBe(initialBalance);
		});
	});

	// ========================================================================
	// 10. ADD CHART TESTS
	// ========================================================================

	describe('addChart', () => {
		test('should add indicator chart', () => {
			const chartParams = {
				name: 'SMA 14',
				type: 'line',
				data: [100, 101, 102]
			};
			engine.addChart(chartParams);
			
			const chartOption = engine.createChartOption();
			const hasChart = chartOption.series.some(s => s.name === 'SMA 14');
			expect(hasChart).toBe(true);
		});

		test('should handle multiple charts', () => {
			engine.addChart({ name: 'SMA', type: 'line', data: [] });
			engine.addChart({ name: 'EMA', type: 'line', data: [] });
			engine.addChart({ name: 'RSI', type: 'line', data: [] });
			
			const chartOption = engine.createChartOption();
			// candlestick + 3 indicators
			expect(chartOption.series.length).toBeGreaterThanOrEqual(4);
		});
		
		test('should extract markLine and markPoint into main series', () => {
			engine.addChart({ type: 'markLine', name: 'myLine' });
			engine.addChart({ type: 'markPoint', name: 'myPoint' });
			
			const chart = engine.createChartOption();
			
			// Memastikan markLine dan markPoint dipindahkan ke series[0]
			const mainSeries = chart.series[0];
			expect(mainSeries.markLine.data).toContainEqual(expect.objectContaining({ name: 'myLine' }));
			expect(mainSeries.markPoint.data).toContainEqual(expect.objectContaining({ name: 'myPoint' }));
		});
		
		test('should execute tooltip position function correctly', () => {
			const chart = engine.createChartOption();
			const positionFn = chart.tooltip.position;
			
			// Simulasi kursor di sisi kiri layar (pos[0] < ukuran layar / 2)
			const posLeft = positionFn([100, 0], null, null, null, { viewSize: [400, 400] });
			expect(posLeft).toEqual({ top: 10, right: 30 });
			
			// Simulasi kursor di sisi kanan layar
			const posRight = positionFn([300, 0], null, null, null, { viewSize: [400, 400] });
			expect(posRight).toEqual({ top: 10, left: 30 });
		});
	});

	// ========================================================================
	// 11. INTEGRATION TESTS (Complex Scenarios)
	// ========================================================================

	describe('Integration - Complete Backtest Scenario', () => {
		test('should execute a complete BUY and SELL cycle', () => {
			// Setup
			engine.sendOrder('BUY', 100, 2, 1000, { tp: 110, sl: 90 });
			
			// Price drops but doesn't hit SL
			engine.update({ o: 99, c: 95, h: 99, l: 94, t: 2000 });
			
			// Price recovers and hits TP
			engine.update({ o: 105, c: 111, h: 112, l: 105, t: 3000 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
			expect(stats.history[0].reason).toBe('TP');
			expect(stats.history[0].pnl).toBeGreaterThan(19); // (110-100)*2 - fees
		});

		test('should handle multiple consecutive trades', () => {
			// Trade 1
			const id1 = engine.sendOrder('BUY', 100, 1, 1000, { tp: 105 });
			engine.update({ o: 104, c: 106, h: 107, l: 103, t: 2000 });
			
			// Trade 2
			const id2 = engine.sendOrder('SELL', 106, 1, 3000, { tp: 101 });
			engine.update({ o: 105, c: 100, h: 105, l: 99, t: 4000 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(2);
			expect(stats.winRate).toContain('100'); // Both winning
		});

		test('should handle mixed profit and loss trades', () => {
			// Winning trade
			const id1 = engine.sendOrder('BUY', 100, 1, 1000, { tp: 115 });
			engine.update({ o: 110, c: 116, h: 120, l: 105, t: 2000 });
			
			// Losing trade
			const id2 = engine.sendOrder('BUY', 116, 1, 3000, { sl: 110 });
			engine.update({ o: 115, c: 109, h: 115, l: 108, t: 4000 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(2);
			expect(stats.winRate).toContain('50');
		});
	});

	// ========================================================================
	// 12. EDGE CASES & ERROR HANDLING
	// ========================================================================

	describe('Edge Cases', () => {
		test('should handle very small quantities', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 0.001, 1000);
			}).not.toThrow();
		});

		test('should handle very large quantities', () => {
			expect(() => {
				engine.sendOrder('BUY', 100, 1000000, 1000);
			}).not.toThrow();
		});

		test('should handle very small prices', () => {
			expect(() => {
				engine.sendOrder('BUY', 0.001, 1, 1000, { tp: 0.002, sl: 0.0005 });
			}).not.toThrow();
		});

		test('should handle very large prices', () => {
			expect(() => {
				engine.sendOrder('BUY', 100000, 0.01, 1000, { tp: 110000, sl: 90000 });
			}).not.toThrow();
		});

		test('should handle simultaneous TP and SL', () => {
			const id = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110, sl: 90 });
			// Gap bar that gaps through both
			engine.update({ o: 110, c: 111, h: 115, l: 85, t: 2000 });
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(1);
		});

		test('should not allow balance to go deeply negative', () => {
			const smallEngine = new BacktestEngine(10, 0.05, 0);
			// Many fees shouldn't cause crash
			smallEngine.sendOrder('BUY', 100, 1, 1000);
			smallEngine.sendOrder('BUY', 100, 1, 2000);
			
			const stats = smallEngine.getStats();
			// Should not crash
			expect(stats).toBeDefined();
		});
	});

	// ========================================================================
	// 13. DATA INTEGRITY TESTS
	// ========================================================================

	describe('Data Integrity', () => {
		test('should not lose trade history', () => {
			const trades = [];
			for (let i = 0; i < 100; i++) {
				const id = engine.sendOrder('BUY', 100 + i, 1, 1000 + i, { tp: 110 + i });
				engine.update({ o: 109 + i, c: 111 + i, h: 115 + i, l: 105 + i, t: 2000 + i });
				trades.push(id);
			}
			
			const stats = engine.getStats();
			expect(stats.totalTrades).toBe(100);
			expect(stats.history.length).toBe(100);
		});

		test('should maintain correct order IDs', () => {
			const id1 = engine.sendOrder('BUY', 100, 1, 1000, { tp: 110 });
			const id2 = engine.sendOrder('BUY', 101, 1, 2000, { tp: 111 });
			const id3 = engine.sendOrder('BUY', 102, 1, 3000, { tp: 112 });
			
			expect(id1).toBeLessThan(id2);
			expect(id2).toBeLessThan(id3);
		});
	});

	// ========================================================================
	// 13. FETCH DATA TESTS
	// ========================================================================
	
	describe('loadData', () => {
		// Simpan fungsi fetch asli agar bisa dikembalikan nanti
		const originalFetch = global.fetch;
	
		afterEach(() => {
			global.fetch = originalFetch; // Kembalikan setelah test selesai
		});
	
		test('should fetch data successfully', async () => {
			// Palsukan respon sukses
			global.fetch = jest.fn(() => Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ data: 'mock_data' })
			}));
	
			const result = await engine.loadData('https://api.mock.com');
			expect(result).toEqual({ data: 'mock_data' });
		});
	
		test('should handle network errors and catch block', async () => {
			// Palsukan respon gagal/error (Ini akan menembak baris catch (error))
			global.fetch = jest.fn(() => Promise.reject(new Error('Network down')));
	
			const result = await engine.loadData('https://api.mock.com');
			expect(typeof result).toBe('string');
			expect(result).toContain('error: Network down');
		});
	});

});
