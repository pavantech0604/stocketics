---
name: openrouter-ai
description: Query and orchestrate frontier AI models via OpenRouter (Claude 3.7 Sonnet, DeepSeek-V3, DeepSeek-R1, Gemini 2.0 Flash) to perform deep reasoning, specialized code architecture, or algorithmic generation directly inside Antigravity IDE.
---

# OpenRouter AI Skill for Antigravity IDE

This skill provides on-demand access to multi-model frontier intelligence through your configured OpenRouter API key.

## Available Models & When to Use Them

- **`deepseek/deepseek-chat` (DeepSeek-V3)**:
  - *Best For*: Fast, high-volume boilerplate code, test suites, documentation, and everyday development at near-zero cost (~$0.14/1M tokens).
- **`deepseek/deepseek-r1` (DeepSeek-R1)**:
  - *Best For*: Deep mathematical logic, quantitative trading formulas, algorithmic risk modeling, complex refactoring with chain-of-thought reasoning.
- **`google/gemini-2.0-flash-001`**:
  - *Best For*: Massive codebase context queries (1M+ tokens), rapid multi-file reviews, real-time code synthesis.
- **`anthropic/claude-3.7-sonnet`**:
  - *Best For*: State-of-the-art frontend UI architecture, complex component lifecycle refactoring, strict type checking.

## How to Query OpenRouter

### 1. Via MCP Server
Antigravity automatically loads the `openrouter` MCP server registered in [`.agents/mcp_config.json`](file:///e:/Apex/.agents/mcp_config.json).
Tools exposed:
- `openrouter_chat`: General prompt execution.
- `openrouter_code_architect`: Targeted architectural and refactoring reviews.
- `openrouter_check_credits`: Check account balance.

### 2. Via CLI Script
Run from terminal or script runner:
```bash
node e:/Apex/.agents/skills/openrouter-ai/scripts/query-model.cjs --model "deepseek/deepseek-chat" --prompt "Explain the React 19 compiler optimization"
```
