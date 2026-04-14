# RedWave Labs Workflow Reference

This directory contains executable Workflow commands that act as entry points for the Antigravity Agent within the RedWave Labs Nx Monorepo. By using these `/commands`, you trigger predefined, multi-agent processes designed to ensure quality and consistency across frontend, backend, and testing.

## 🚀 Execution Commands

You can trigger any workflow by typing its path or command prefix in your prompt.
Example: `/plan user authentication system` or `/test web`

---

### 📅 Phase 0: Ideation & Planning

_Do not write code before requirements are clear!_

| Command           | Agent                           | Description                                                                                                                                 | Usage Example                          |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **`/brainstorm`** | `product-manager` / `team-lead` | Structured brainstorming for projects and features. Explores multiple options, tradeoffs, and edge-cases before implementation.             | `/brainstorm next-gen auth approaches` |
| **`/plan`**       | `product-manager`               | Creates a comprehensive project plan (`docs/{version}/3-plans/PLAN-xxx.md`) based on detailed Socratic questioning. **No code is written.** | `/plan real-time chat feature`         |

---

### 🏗️ Phase 1: Setup & Architecture

_Scaffolding applications, packages, and underlying infrastructure._

| Command                  | Agent                 | Description                                                                                                            | Usage Example                                 |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **`/init-monorepo`**     | `team-lead`           | Initializes the entire RedWave Labs Nx Monorepo architecture (Next.js, NestJS, Prisma). Use only for fresh setups.     | `/init-monorepo`                              |
| **`/generate-project`**  | `team-lead`           | Scaffolds a new App (frontend/backend) or Library (UI/feature code) inside the monorepo, using official Nx Generators. | `/generate-project new Next.js dashboard app` |
| **`/setup-frontend-ui`** | `frontend-specialist` | Integrates TailwindCSS and Shadcn UI into an existing Next.js application, organizing them properly.                   | `/setup-frontend-ui apps/web-dashboard`       |

---

### 🎨 Phase 2: Design & Implementation

_Writing code, designing interfaces, and cross-agent orchestrations._

| Command               | Agent            | Description                                                                                                                              | Usage Example                                  |
| --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **`/design-feature`** | `ui-ux-designer` | Brainstorms and designs UI/UX for a new feature directly via the StitchMCP UI Design tool, exporting specifications.                     | `/design-feature landing page pricing section` |
| **`/orchestrate`**    | (All Agents)     | Coordinates a multi-agent assembly line. Used for complex full-stack features requiring Frontend, Backend, and DB agents simultaneously. | `/orchestrate implement user login system`     |

---

### 🧪 Phase 3: QA & Testing

_Automated validation and test suite execution._

| Command     | Agent         | Description                                                                                                            | Usage Example                                           |
| ----------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **`/test`** | `qa-engineer` | Generates or executes tests strictly using `nx test` or `nx e2e`. Interprets failures and attempts self-healing fixes. | `/test web`, `/test e2e api`, `/test apps/web/utils.ts` |

---

## 🛑 How the Gate Rules Apply

Every single workflow command obeys the **Socratic Gate (Tier 0)** rules defined in `.agents/GEMINI.md`. If your request to the workflow is too vague to be safely executed, the invoked Agent _will_ block the process and ask clarifying questions first.

_If asked an architectural question by an agent, please answer clearly so the workflow can safely proceed._

## Extending Workflows

To create a new workflow:

1. Add a Markdown file to this `.agents/workflows` directory.
2. The frontmatter MUST include `description: <brief explanation>`.
3. The content should clearly outline the **Purpose**, the **CRITICAL RULES**, and the **Task Execution Steps**.
4. Reference the specific RedWave Labs Agents (e.g., `team-lead`, `qa-engineer`) or Skills that should be activated.
