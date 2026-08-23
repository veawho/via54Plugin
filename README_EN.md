<div align="center">

# via54Plugin

> **🌐 Language**: [🇨🇳 中文](./README.md) | [🇺🇸 English](#) (current)
>
> _This document is in English. For Chinese, click above._

</div>

---

# via54Plugin

> Universal plugin-based monolithic workspace framework for via54 series projects (npm workspaces)

`via54Plugin` is a dual-compatible multi-plugin monorepo for AI Agents. It is designed to run natively both as a **Cordis plugin** for `DeepSeek_harness` and as a generic **Model Context Protocol (MCP) service**, providing plug-and-play multi-functional integration for mainstream IDE/AI clients (Antigravity, Claude Code, Codex, zcode, workbuddy, CodeBuddy, Traework, etc.).

To support **physical isolated deployment** and **slim dependency fetching**, this project adopts the standard **npm workspaces** flat monorepo structure.

---

## 📁 Directory Structure & Plugin Matrix

Each plugin is stored as an independent sub-package flatly under the root directory, with its own `package.json` and build context:

```
via54Plugin/ (Root Directory)
├── package.json (Global workspace management)
├── README.md (Root documentation)
├── LICENSE (License agreement)
├── via54lab_core/ (Unified management center)
│   ├── package.json
│   ├── src/mcp.ts (Unified MCP protocol server)
│   └── src/cli.ts (Multi-plugin self-check and repair console)
├── via54lab_crawler/ (Web crawler plugin)
│   ├── package.json
│   └── src/index.ts (Anti-detection Playwright web scraping module)
├── via54lab_medit/ (Medical routing plugin)
│   ├── package.json
│   └── src/index.ts (Medical evidence-based, PICO retrieval module)
├── via54lab_design/ (Design system plugin)
│   ├── package.json
│   └── src/index.ts (Bento-style layout Prompt generator module)
├── via54lab_algo/ (Algorithm routing plugin)
│   ├── package.json
│   └── src/index.ts (Algorithm distribution routing adapter module)
└── via54lab_larkgroups/ (Group message sync plugin)
    ├── package.json
    └── src/index.ts (Feishu group message persistent storage module)
```

---

## 🛠️ Installation & Build

### 1. Global Workspace Bootstrap & Compilation
Run the following commands in the repository root. npm will automatically resolve and establish local links between workspaces, and compile all packages concurrently:
```bash
# Install and link all plugin dependencies
npm install

# Compile and build JS artifacts for all sub-plugins
npm run build
```

### 2. Sparse Checkout & Deployment for Individual Packages
If you need to deploy only a specific plugin (e.g., `medit`) on a target device, you can use Git sparse checkout to fetch only that package, preventing pollution and saving disk space:
```bash
git clone --no-checkout https://github.com/veawho/via54Plugin.git
cd via54Plugin
git sparse-checkout set via54lab_core via54lab_medit
git checkout
cd via54lab_medit && npm install
```

---

## 🔍 Dependency Self-Check & Unattended Repair Mechanism

Each independent plugin declares its required system tools (binaries), Python libraries, and global NPM packages. You can use a unified command-line tool for automatic environment validation during deployment:

```bash
# 1. Check local dependency status required by the medit plugin (pdftotext, lark-cli, PIL, etc.)
npm run plugin:check -- medit

# 2. Silently install and repair missing packages for medit (add -y / --yes for fully unattended silent deployment)
npm run plugin:deploy -- medit -y
```

Optional plugin targets: `crawler`, `medit`, `design`, `algo`, `larkgroups`.

---

## 🔌 Client Integration Configuration

### 1. Loading as an MCP Server (for Antigravity / Claude Code, etc.)
Add the following Stdio server configuration to your client configuration file (e.g., `config.json` or `mcp_config.json`) to directly invoke the compiled artifact of the `via54lab_core` package:

```json
{
  "mcpServers": {
    "via54-plugin": {
      "command": "node",
      "args": ["C:/Users/via54/Desktop/developments/via54Plugin/via54lab_core/dist/mcp.js"]
    }
  }
}
```

### 2. Loading as a Cordis Plugin (for DeepSeek Harness)
Declaratively load each sub-plugin module in the `DeepSeek_harness` configuration file:
```yaml
plugins:
  via54-medit:
    llm: "MiniMax-M3"
  via54-crawler:
    proxy: "http://localhost:1080"
```

---

## 📄 Open Source License
This repository follows the **AGPL-3.0-or-later** license agreement.
