---
description: Test generation and execution command. Analyzes backtest reports and tests EA behavior using ea-tester.
---

# /test - EA Backtest & Strategy Validation

$ARGUMENTS

---

## Purpose

This command utilizes the `ea-tester` agent to analyze Strategy Tester (or cTrader backtest) outputs, check logs, or evaluate a backtest for RedWave Labs EAs/cBots.

---

## 🔴 CRITICAL RULES

1. **Agent Selection**: ALWAYS route this request to the `ea-tester` agent.
2. **Relevant Skills**: Apply `ea-debugging-patterns` (and `mql5-docs-research` for obscure MT5 codes).
3. **Focus on trading platforms**: Not web/unit-test suites. Prefer MT5 error codes (10016, 4756, 10013), invalid stops, fill modes, drawdown stats; for cBot, reason about logs/results the user provides with the same risk mindset.

## Sub-commands & Usage

```
/test report [file.xml/html] - Analyze a Strategy Tester (or exported) report
/test logs [journal.log]     - Search for errors in terminal logs
/test logic                  - Suggest edge-case tests (slippage, gaps, widen spread)
```

## Behavior

1. Analyze given data (profits, drawdowns, trade frequency, latency/modify spam).
2. Propose fixes to inputs, symbols, timeframe, or code handoff to `mql5-expert` / `cbot-expert` if tests fail.
3. Use text search on log files when an exact error string is needed.
4. Store lasting write-ups under `docs/{version}/5-reports/` when the user wants a durable report (follow `documentation-standards`).
