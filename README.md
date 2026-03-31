# 🚀 JS Algorithmic Backtesting Engine

[![CI/CD Build](https://img.shields.io/github/actions/workflow/status/miftahul001/js-algorithmic-backtesting-engine/ci.yml?style=for-the-badge&label=CI/CD%20Build)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/actions)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge&logo=jest)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/actions)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20Now-success?style=for-the-badge)](https://miftahul001.github.io/js-algorithmic-backtesting-engine/)
[![JavaScript](https://img.shields.io/badge/Vanilla-JS-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Documentation](https://img.shields.io/badge/Docs-DOCUMENTATION.md-green?style=for-the-badge)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)

A lightweight, high-performance, in-browser algorithmic trading backtesting engine built entirely with Vanilla JavaScript. 

This project serves as a comprehensive tool to write, test, and visualize trading strategies (EAs) and indicators without the need for a backend server or heavy frameworks.

---

![Preview](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/preview.png?raw=true)

---


## ✨ Key Features

* 💻 **In-Browser IDE:** Write and edit trading strategies on the fly using the integrated CodeMirror editor.
* ⚡ **Zero-Dependency Core Engine:** The backtesting logic (order execution, PnL calculation, slippage, fees) is built entirely from scratch in standard ES6+ JavaScript.
* 📊 **Interactive Visualization:** High-performance charting powered by Apache ECharts, capable of rendering large candlestick datasets and custom indicator lines.
* 💰 **Realistic Trade Simulation:** Accurately simulates real-world trading conditions including custom fee percentages, slippage points, Trailing Take Profit (TP), and Stop Loss (SL).
* 🗂 **Local Strategy Management:** Load preset strategies, import your own `.js` scripts, and download your modified code directly from the UI.
* 📈 **Detailed Analytics:** Automatically generates trading statistics (Win Rate, Total PnL, Final Balance) and a comprehensive trade history log.

## 🛠 Tech Stack

* **Logic & UI:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom CSS Variables)
* **Code Editor:** [CodeMirror](https://codemirror.net/) (Dracula Theme)
* **Charting:** [Apache ECharts](https://echarts.apache.org/)
* **Icons:** FontAwesome

## 🚀 Getting Started

Since this is a client-side application, you can test it immediately without any installation.

1.  **Open the Live Demo:** Go to [JS Algorithmic Backtesting Engine](https://miftahul001.github.io/js-algorithmic-backtesting-engine/).
2.  **Load a Strategy:** Click the **Load Script** button in the toolbar and select a preset indicator (e.g., SMA, EMA) or EA (e.g., MA Crossover).
3.  **Run the Engine:** Click the **Run** button to execute the code against the provided dataset.
4.  **Analyze:** Switch between the `Chart`, `Trading Stats`, and `Trading History` tabs in the right panel to evaluate the strategy's performance.

## 🧠 Core Architecture (How it works)

The engine revolves around the `BacktestEngine` class (`engine.js`), which handles the spatial disparity of the charts and execution logic:

* **State Management:** Tracks Balance, Equity, Positions, and History.
* **Order Execution:** `sendOrder()`, `modifyOrder()`, and `closeOrder()` methods simulate broker interactions.
* **Dynamic Updating:** The `update(bar)` method feeds candlestick data tick-by-tick, evaluating TP/SL conditions at every step to prevent look-ahead bias.

## 👨‍💻 Developer / Hire Me

This project was built to demonstrate proficiency in advanced DOM manipulation, class-based JavaScript architecture, financial algorithm logic, and third-party library integration.

If you are looking for a developer to build custom trading tools, web applications, or data visualization dashboards, feel free to reach out!

---

## 🤝 Open for Work

I am available for:

* JavaScript development (Frontend / Logic)
* Data visualization & dashboard (ECharts)
* Trading tools & backtesting systems

📩 Contact: [miftahulmunir001@gmail.com](mailto:miftahulmunir001@gmail.com)  
🔗 LinkedIn: https://www.linkedin.com/in/miftahul-munir-1530888b/

---


## 🚀 Public Roadmap: Backtest Pro

We are building a fully decentralized, private, and high-speed client-side computing ecosystem. Here is our development roadmap:

### ✅ Phase 1: Core Engine Foundation (Completed)
This phase focuses on building the foundational infrastructure without relying on heavy frameworks.
	* **Vanilla JS State Management & Router:** Zero dependencies.
	* **Local Storage Wrapper:** Engineered to store gigabytes of candlestick data directly in the browser.
	* **Modular UI Architecture:** Powered by Vite's eager import for lightning-fast rendering.

### ⏳ Phase 2: Freemium MVP (In Progress)
The initial public release, allowing traders to perform essential backtesting for free.
	* **Sliding Window Rendering:** Apache ECharts integration to visualize millions of data points with $O(1)$ space complexity.
	* **Just-In-Time (JIT) API Sync:** Dynamic synchronization of Exchange configurations without slowing down the boot process.
	* **Local File Chunking:** Securely process massive local CSV uploads without crashing the browser's RAM.
	* **Limited Data Fetching (Free Tier):** Access to download historical crypto/stock market data with monthly request limits.
	* **Internationalization (i18n):** Multi-language support with English as the default, and localization options (e.g., Indonesian).

### 💎 Phase 3: Backtest Pro Version (Coming Soon)
The premium tier designed for hardcore computation, live simulation, and deployment-ready automation.
	* **Unlimited API Fetching:** Download decades of historical data directly from exchanges with zero limitations.
	* **Multi-Threaded Execution:** Advanced Web Workers process technical indicators (RSI, MACD) in parallel background threads. This ensures the UI remains at a buttery-smooth 60 FPS while effortlessly running backtests across decades of data.
	* **Custom Strategy Builder:** A built-in CodeMirror editor to write, test, and execute your custom algorithmic trading strategies in a secure, isolated sandbox.
	* **Automated Data Seeding:** Instant sample data injection upon first launch for immediate simulation and testing.
	* **Live Paper Trading (Forward Testing):** Seamlessly transition from historical backtesting to live market simulation. The engine connects to public Exchange WebSockets to test your strategy against real-time price movements without risking actual capital.
	* **One-Click Bot Deployment:** Ready to go live? Export your proven strategy as a standalone, production-ready Node.js bundle. Deploy it directly to your own VPS for 24/7 automated trading, ensuring your private API keys never touch our servers.

---
💡 **Interested in the Pro Version?** The core execution engine is currently being built in stealth mode. Join our waitlist to get *Early Beta* access and exclusive launch offers.
