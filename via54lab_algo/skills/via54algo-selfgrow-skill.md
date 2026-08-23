---
name: via54algo-selfgrow-skill
description: General meta-scheduler and self-growth algorithm - dynamically scanning local workspaces, auto-extracting skill pitfalls/rules, and injecting them into system prompts to optimize any LLM plugin workflow.
version: 2.0.0
---

# via54algo · 通用元调度与自生长自学习算法技能

> 负责协调编排设备上的可用工具（Tools/MCP）、大模型与 Agent 资源，根据反馈自动进行提示词演化与性能自我成长。

## When to Use

Use when:
- Coordinating tasks that span across multiple independent local plugins.
- Improving LLM system prompts dynamically by injecting rule-based skills.
- Performing generalized feedback learning to improve tool-chain weights.

## Core Universal Capabilities

### 1. Universal Workspaces Scan (通用环境感知)
- Scans all package directories in the current folder for `skills/` and `src/mcp.ts` tool descriptions.

### 2. Skill Ingestion and Injection (通用技能与避坑规则提取注入)
- Dynamically parses any `SKILL.md` or `*-skill.md` files.
- Extracts headers like `## Pitfalls`, `## How to use`, or `## Decision Matrix`.
- Compiles rules matching the task keywords into system prompt constraints to optimize LLM outputs and avoid common mistakes.
