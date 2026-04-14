---
description: Test generation and execution command. Analyzes backtest reports and tests EA behavior using ea-tester.
---

# /test - EA Backtest & Strategy Validation

$ARGUMENTS

---

## Purpose

This command utilizes the `ea-tester` agent to analyze Strategy Tester outputs, check logs, or evaluate a backtest for the RedWave Labs EA.

---

## 🔴 CRITICAL RULES

1. **Agent Selection**: ALWAYS route this request to the `ea-tester` agent.
2. **Relevant Skills**: Apply `ea-debugging-patterns`.
3. **Focus on MetaTrader**: This is not web testing. Look for MT5 error codes (10016, 4756, 10013), invalid parameters, and drawdown stats.

## Sub-commands & Usage

```
/test report [file.xml/html] - Analyze a Strategy Tester report
/test logs [journal.log]     - Search for errors in terminal logs
/test logic                  - Suggest edge-case tests (slippage, gaps, widen spread)
```

## Behavior

1. Analyze given data (Profits, Drawdowns, Latency).
2. Propose fixes to the inputs, symbols, or timeframe if tests fail.
3. Use `grep_search` on log files if an exact error string is needed.
