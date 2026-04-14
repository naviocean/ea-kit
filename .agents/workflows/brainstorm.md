---
description: Structured brainstorming for trading ideas and AI predictors. Explores multiple options before implementation.
---

# /brainstorm - Trading Strategy Idea Exploration

$ARGUMENTS

---

## Purpose

This command activates BRAINSTORM mode for structured strategy exploration using the `algo-strategist`. Use when you need to explore market logic options before committing to EA implementation.

---

## Behavior

When `/brainstorm` is triggered:

1. **Understand the goal (Socratic Gate)**
   - ACTIVATE the `algo-strategist` agent to enforce the Socratic Gate.
   - ASK minimum 3 questions to clarify: Market condition (Trend/Range/News)? Prop-firm or personal? Acceptable max drawdown?
   - DO NOT start generating options until the user has answered these questions.

2. **Generate options**
   - Provide at least 3 different algorithmic approaches (e.g., Breakout vs Reversion).
   - Each with pros and cons (Drawdown vs Profit Factor).
   - Consider MQL5 limitations (Tick data vs Open Prices).

3. **Compare and recommend**
   - Summarize tradeoffs.
   - Give a recommendation with reasoning.

---

## Output Format

```markdown
## 🧠 Strategy Brainstorm: [Topic]

### Context
[Brief problem statement]

---

### Option A: [Name]
[Description]

✅ **Pros:**
- [High Profit Factor, etc]

❌ **Cons:**
- [High latency risk, vulnerable to slippage]

📊 **Effort to Code in MQL5:** Low | Medium | High

---

## 💡 Recommendation
**Option [X]** because [reasoning].

What direction would you like to explore?
```

---

## Examples

```
/brainstorm hedging vs netting strategy
/brainstorm dynamic lot sizing algorithms
/brainstorm RSI and MACD entry filters
/brainstorm RL model integration for MT5
```
