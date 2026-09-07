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

To support **physical isolated deployment** and **slim dependency fetching**, this project adopts the standard **npm workspaces** flat monorepo structure: the root keeps one unified `package-lock.json`, while each sub-package declares only its own dependencies and can be sparse-checked-out or installed independently.

---

## 📁 Directory Structure & Plugin Matrix

Each plugin is stored as an independent sub-package flatly under the root, with its own `package.json` and build context. Apart from `core`, every sub-package typically provides both a **Cordis plugin entry** (`src/index.ts`, a `name`/`apply` function plugin) and a **standalone MCP server** (`src/mcp.ts`); some also ship Python scripts (`src/*.py`), `config/` defaults, and `skills/` documentation.

```
via54Plugin/ (Root Directory)
├── package.json              Global workspace management (workspaces + build aggregate)
├── package-lock.json         Single dependency lock (reproducible via npm ci)
├── tsconfig.base.json        Shared compiler baseline for CommonJS sub-packages
├── README.md / README_EN.md  Root documentation (Chinese / English)
├── LICENSE                   License (AGPL-3.0-or-later)
│
├── via54lab_core/            Unified management center
│   ├── src/mcp.ts            Unified MCP protocol server (aggregates cross-plugin tools)
│   ├── src/cli.ts            Dependency self-check & auto-deploy console (check/deploy)
│   └── src/types.ts          Plugin dependency metadata and plugin-module types
│
├── via54lab_crawler/         Web crawler plugin
│   ├── src/index.ts          Cordis plugin entry (name/apply)
│   ├── src/mcp.ts            Standalone MCP server
│   └── src/scrape.py         Anti-detection Playwright scraping script
│
├── via54lab_medit/           Medical evidence-routing plugin
│   ├── src/index.ts          Cordis plugin entry
│   ├── src/mcp.ts            Standalone MCP server
│   ├── bin/medit.exe         Bundled executable
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_medfeed/         Medical triage & archive plugin
│   ├── src/index.ts          Cordis plugin entry
│   ├── src/mcp.ts            Standalone MCP server
│   └── src/pull_*.py         Medical-guideline / pricing-policy fetch scripts
│
├── via54lab_design/          Design-system plugin (Bento layout prompt generation)
│   ├── src/index.ts          Cordis plugin entry
│   ├── src/mcp.ts            Standalone MCP server
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_algo/            Algorithm-routing plugin
│   ├── src/index.ts          Cordis plugin entry
│   ├── src/mcp.ts            Standalone MCP server
│   ├── src/selfgrow.py       Self-growing / deduplication script
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_larkgroups/      Feishu group-message sync plugin
│   ├── src/index.ts          Cordis plugin entry
│   └── src/mcp.ts            Standalone MCP server
│
├── via54lab_report/          Sales-report plugin
│   ├── src/index.ts          Cordis plugin entry
│   ├── src/mcp.ts            Standalone MCP server
│   ├── src/main.py           Report-filling & proofreading script
│   └── data/                 Static data (e.g. drugs_base.csv)
│
└── via54lab_wechat/          WeChat article parser plugin (three modes)
    ├── src/dsh/plugin.ts     Cordis plugin entry (registers tools)
    ├── src/mcp/server.ts     Standalone MCP server
    ├── src/cli/index.ts      Standalone CLI (bin: wechat-parser)
    └── src/core/parser.ts    Core parsing implementation
```

**Build convention**: every sub-package compiles its TypeScript into its own `dist/` (gitignored, never committed); CommonJS sub-packages extend the root `tsconfig.base.json`, while `via54lab_wechat` uses a separate ESM face. `main` points at the compiled artifact under `dist/`, so a fresh clone must build before running.

---

## 🛠️ Installation & Build

### 1. Global Workspace Bootstrap & Compilation
Run the following in the repository root. npm resolves the workspaces, establishes local links, and compiles every sub-package:

```bash
# Install and link all plugin dependencies (creates/updates the root package-lock.json)
npm install

# Compile all sub-plugins into their dist/
npm run build
```

CI (`.github/workflows/ci.yml`) runs the same `npm install && npm run build` on Node 20.

### 2. Single Lock File & Reproducible Installs
This repository keeps exactly one `package-lock.json` at the root; sub-packages no longer carry their own lock files. Use this for reproducible installs:

```bash
npm ci
```

### 3. Sparse Checkout & Deployment for Individual Packages
If you need to deploy only a few plugins on a target device, use Git sparse checkout to fetch only those sub-packages:

```bash
git clone --no-checkout https://github.com/veawho/via54Plugin.git
cd via54Plugin
git sparse-checkout set via54lab_core via54lab_medit tsconfig.base.json
git checkout
cd via54lab_medit && npm install
```

### 4. Windows Isolated Install per Package
If `npm install` at the repository root fails on Windows with an `EISDIR` symlink error (usually because Developer Mode is off or you lack admin rights), enter the sub-package and install/build it in isolation:

```bash
cd via54lab_core
npm install
npm run build
```

### 5. Environment Variables & Dynamic Path Resolution
Sub-plugins resolve dependency executables or external Python scripts **dynamically**: by default they look for sibling projects in the repository's parent directory (e.g. `G:\agent\ai\projects` or `C:\Users\via54\Desktop\developments`). When deploying elsewhere, point them at the parent with an environment variable:

- **`VIA54_PROJECTS_DIR`** — parent directory of the related project repos (e.g. `via54Crawler`, `via54Medit`).

Python scripts are invoked by the sub-plugins as needed; the target machine must have the required Python libraries installed (see the header of each `src/*.py` or the `core` dependency checker).

---

## 🔍 Dependency Self-Check & Automatic Repair

Each plugin declares its runtime system tools, Python libraries, and global npm packages in `DependencyMeta` in `core/src/types.ts`. After building `core`, use the unified CLI to check or repair:

```bash
# Build core first if it has not been built yet
cd via54lab_core && npm run build && cd ..

# 1. Check the local dependencies the medit plugin needs (pdftotext, lark-cli, PIL, ...)
node via54lab_core/dist/cli.js check medit

# 2. Check and automatically install missing dependencies (unattended)
node via54lab_core/dist/cli.js deploy medit -y
```

`core` CLI plugin targets: `crawler`, `medit`, `design`, `algo`, `larkgroups`, `report`.

---

## 🔌 Client Integration Configuration

### 1. Loading as an MCP Server (Antigravity / Claude Code, etc.)

For a single sub-package, point at its `dist/mcp.js`; for the unified `core` entry, point at `via54lab_core/dist/mcp.js`:

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

### 2. Loading as a Cordis Plugin (DeepSeek Harness)

Each sub-package's `src/index.ts` is a standard Cordis function plugin (exports `name` and `apply`) and can be added to an agent preset or profile composition. `via54lab_wechat` also registers model-visible tools through `ctx.tools.register` when mounted. Example row (profile / preset YAML form):

```yaml
- id: via54-medit
  name: '@via54/plugin-medit'
  config:
    llm: MiniMax-M3
```

### 3. Local Integration & Validation Status
- The root workspaces aggregate build passes: every sub-package's `npm run build` emits its own `dist/`.
- `via54lab_core`'s `cli` and unified `mcp` entries run; the MCP SDK is unified on `^1.0.0`.
- Sub-packages have been mounted and probed in a local DeepSeek Harness composition (see each sub-package README).

---

## 📄 Open Source License
This repository follows the **AGPL-3.0-or-later** license agreement.
