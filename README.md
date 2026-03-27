# 🚀 JS Algorithmic Backtesting Engine

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Now-success?style=for-the-badge)](https://miftahul001.github.io/js-algorithmic-backtesting-engine/)
[![JavaScript](https://img.shields.io/badge/Vanilla-JS-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Documentation](https://img.shields.io/badge/Docs-DOCUMENTATION.md-green)](https://github.com/miftahul001/js-algorithmic-backtesting-engine/blob/main/DOCUMENTATION.md)

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

