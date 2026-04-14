# RedWave Labs MQL5 EA Agent Kit

Standard AI Agent kit for RedWave Labs internal development projects, specifically optimized for MetaTrader 5 (MQL5) Algorithmic Trading workflows.

## Quick Start

1. Copy the entire `.agents` folder (including Agent profiles and Skills) into the root directory (`/`) of your project folder.
2. Establish global operation rules by appending the contents of `.agents/rules/GEMINI.md` to the AI's system prompt or rule-set.
3. Activate and command the AI to perform tasks via provided Agent scripts or routing workflows (e.g., `/brainstorm`, `/plan`, `/orchestrate`, `/test`).

## Core Framework: RWCommon Pattern
This Agent Kit enforces the **RWCommon Library** architecture. Every Agent is trained to structure logic and route trade orders via standard wrapper classes to ensure institutional-level reliability, error handling (e.g. 10016), and pip/point scaling. Native MT5 `OrderSend` usage is heavily restricted unless explicitly bypassing RWCommon.

## Features

- **Lean Agent Roles**: Built with 3 highly-focused MQL5 Agent personas: `algo-strategist` (Strategy & Brainstorming), `mql5-expert` (OOP Code Implementation), and `ea-tester` (Log Bug-hunting & Strategy Tester analysis).
- **MetaTrader 5 Mastery**: Deep understanding of MQL5 nuances including ArraySetAsSeries, tick-based scaling, `StopsLevel` compliance, Indicator Buffers (Visible/Hidden), and memory management.
- **Intelligent Agent Routing (Tier 1)**: Automatically analyzes requirements when solving issues, sending code writing to the Dev, and log file analysis to the Tester.
- **Socratic Gate (Tier 0)**: A strict barrier protocol forcing the AI to ask clarifying questions about Timeframes, Account Risk parameters, and Logic gaps before writing any strategy code.
- **Lazy-loading Skills Ecosystem**: No context overload. The Agents dynamically pull specific expertise modules (`mql5-clean-code`, `ea-debugging-patterns`, `rwcommon-library-patterns`, etc.) ONLY when triggered by the task content.

---

**Note**: This repository strictly follows RedWave Labs' EA `documentation-standards`.
