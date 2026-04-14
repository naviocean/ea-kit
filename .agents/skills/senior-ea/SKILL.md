---
name: Senior EA Developer
description: Meta-skill indexing the RedWave MQL5 developer guidelines. Do not read for detailed implementation rules.
---
# RedWave MQL5 Master Index

This is a master directory of available skills for EA MetaTrader 5 development in this monorepo. **Instead of holding rules here, load the specific skill below for your exact task.**

- **Architecture, File Structures & Clean Code**: `@[.agents/skills/mql5-clean-code/SKILL.md]`
- **Using Trade/Risk/Position Modules (TradeExecutor, TrailingManager, RiskManager)**: `@[.agents/skills/rwcommon-library-patterns/SKILL.md]`
- **Logging, Debugging (Error 10016), Deinit Cleanup**: `@[.agents/skills/ea-debugging-patterns/SKILL.md]`

If you need to execute trades, DO NOT write MT5 Core API code directly unless necessary. Rely on `rwcommon-library-patterns`.
