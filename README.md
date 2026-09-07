<div align="center">

# via54Plugin

> **🌐 Language**: [🇨🇳 中文](#) (current) | [🇺🇸 English](./README_EN.md)
>
> _This document is in Chinese. For English, click above._

</div>

---

# via54Plugin

> via54 系列项目通用插件化集成单体工作区框架（npm workspaces）

`via54Plugin` 是一个双重兼容的 AI Agent 多插件单体仓库。它被设计为既能作为 `DeepSeek_harness` 的 **Cordis 插件** 原生挂载运行，又能作为通用的 **Model Context Protocol (MCP) 服务** 运行，为主流 IDE/AI 客户端（Antigravity、Claude Code、Codex、zcode、workbuddy、CodeBuddy、Traework 等）提供即插即用的多功能集成能力。

为了支持**物理隔离部署**和**精简依赖拉取**，本项目采用标准的 **npm workspaces** 扁平单体包结构：根目录持有一份统一的 `package-lock.json`，各子包只声明自己的依赖，可被 Git 稀疏检出或独立安装。

---

## 📁 目录结构与插件矩阵

各插件以独立子包的形式扁平化存放在根目录下，拥有独立的 `package.json` 与构建上下文。除 `core` 外，每个子包一般同时提供 **Cordis 插件入口**（`src/index.ts`，`name`/`apply` 函数插件）与 **独立 MCP 服务端**（`src/mcp.ts`）；部分子包还带 Python 脚本（`src/*.py`）、`config/` 默认配置与 `skills/` 技能文档。

```
via54Plugin/ (根目录)
├── package.json              全局工作区管理（workspaces + build 聚合）
├── package-lock.json         单一依赖锁（npm ci 可复现）
├── tsconfig.base.json        CommonJS 子包共享的编译器基线
├── README.md / README_EN.md  根说明文档（中 / 英）
├── LICENSE                   许可协议（AGPL-3.0-or-later）
│
├── via54lab_core/            统一管理中心
│   ├── src/mcp.ts            统一 MCP 协议服务端（聚合跨插件工具）
│   ├── src/cli.ts            依赖自检与自动部署控制台（check/deploy）
│   └── src/types.ts          插件依赖元数据与插件模块类型
│
├── via54lab_crawler/         网页爬虫插件
│   ├── src/index.ts          Cordis 插件入口（name/apply）
│   ├── src/mcp.ts            独立 MCP 服务端
│   └── src/scrape.py         防检测 Playwright 爬取脚本
│
├── via54lab_medit/           医学循证路由插件
│   ├── src/index.ts          Cordis 插件入口
│   ├── src/mcp.ts            独立 MCP 服务端
│   ├── bin/medit.exe         随附可执行文件
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_medfeed/         医学整理与归档插件
│   ├── src/index.ts          Cordis 插件入口
│   ├── src/mcp.ts            独立 MCP 服务端
│   └── src/pull_*.py         医学指南 / 定价政策拉取脚本
│
├── via54lab_design/          设计系统插件（Bento 布局 Prompt 生成）
│   ├── src/index.ts          Cordis 插件入口
│   ├── src/mcp.ts            独立 MCP 服务端
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_algo/            算法路由插件
│   ├── src/index.ts          Cordis 插件入口
│   ├── src/mcp.ts            独立 MCP 服务端
│   ├── src/selfgrow.py       自增长/去重脚本
│   └── config/               config.default.yaml / config.yaml
│
├── via54lab_larkgroups/      飞书群消息同步插件
│   ├── src/index.ts          Cordis 插件入口
│   └── src/mcp.ts            独立 MCP 服务端
│
├── via54lab_report/          销售报表子插件
│   ├── src/index.ts          Cordis 插件入口
│   ├── src/mcp.ts            独立 MCP 服务端
│   ├── src/main.py           报表填写与校对脚本
│   └── data/                 静态数据（如 drugs_base.csv）
│
└── via54lab_wechat/          微信公众号文章解析插件（三模式）
    ├── src/dsh/plugin.ts     Cordis 插件入口（tools 注册）
    ├── src/mcp/server.ts     独立 MCP 服务端
    ├── src/cli/index.ts      独立 CLI（bin: wechat-parser）
    └── src/core/parser.ts    核心解析实现
```

**构建约定**：所有子包的 TypeScript 都编译到各自 `dist/`（已 gitignore，不入库）；CommonJS 子包继承根 `tsconfig.base.json`，`via54lab_wechat` 单独使用 ESM 面。`main` 指向 `dist/` 下的编译产物，克隆后需先构建才能运行。

---

## 🛠️ 安装与构建

### 1. 全局工作区引导与编译
在仓库根目录下执行，npm 会解析 workspaces、建立本地链接并编译所有子包：

```bash
# 安装并链接所有插件依赖（生成/更新根 package-lock.json）
npm install

# 编译所有子插件到各自 dist/
npm run build
```

CI（`.github/workflows/ci.yml`）在 Node 20 上执行同样的 `npm install && npm run build`。

### 2. 单一依赖锁与可复现安装
本仓库只保留根目录一份 `package-lock.json`；子包不再各自携带 lock 文件。需要可复现安装时使用：

```bash
npm ci
```

### 3. 独立包稀疏检出与部署
如果只需要在目标设备上部署某几个插件，可用 Git 稀疏检出只拉取对应子包：

```bash
git clone --no-checkout https://github.com/veawho/via54Plugin.git
cd via54Plugin
git sparse-checkout set via54lab_core via54lab_medit tsconfig.base.json
git checkout
cd via54lab_medit && npm install
```

### 4. Windows 下独立包隔离安装
若在 Windows 上对仓库根执行 `npm install` 遇到 `EISDIR` 软链接失败（通常是未开启开发者模式或缺少管理员权限），可直接进入子包目录做隔离安装与编译：

```bash
cd via54lab_core
npm install
npm run build
```

### 5. 环境变量与动态路径解析
子插件对依赖可执行文件或外部 Python 脚本采用**动态路径解析**：默认在仓库父目录查找同级项目（如 `G:\agent\ai\projects` 或 `C:\Users\via54\Desktop\developments`）。部署到其他位置时，用环境变量指定父目录：

- **`VIA54_PROJECTS_DIR`** — 相关项目仓库（如 `via54Crawler`、`via54Medit` 等）所在父目录。

Python 脚本由子插件按需调用，需目标机装有对应 Python 库（见各子包 `src/*.py` 顶部说明或 `core` 的依赖自检）。

---

## 🔍 依赖自检与自动修复

各插件把运行所需系统工具、Python 库与全局 npm 包声明在 `core/src/types.ts` 的 `DependencyMeta` 中。构建 `core` 后可用统一 CLI 自检/修复：

```bash
# 先构建 core（若尚未构建）
cd via54lab_core && npm run build && cd ..

# 1. 检测 medit 插件所需本地依赖（pdftotext、lark-cli、PIL 等）
node via54lab_core/dist/cli.js check medit

# 2. 检测并自动安装缺失依赖（无人值守）
node via54lab_core/dist/cli.js deploy medit -y
```

`core` CLI 支持的插件目标：`crawler`、`medit`、`design`、`algo`、`larkgroups`、`report`。

---

## 🔌 客户端集成配置

### 1. 作为 MCP 服务器加载（Antigravity / Claude Code 等）

单个子包作为 MCP 服务端时，指向它的 `dist/mcp.js`；使用 `core` 统一入口时指向 `via54lab_core/dist/mcp.js`。例如：

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

### 2. 作为 Cordis 插件加载（DeepSeek Harness）

子包 `src/index.ts` 是标准 Cordis 函数插件（导出 `name` 与 `apply`），可加入 agent preset 或 profile 组合。`via54lab_wechat` 还会在挂载时通过 `ctx.tools.register` 注册模型可见工具。加载示例（profile / preset 的 YAML 行形式）：

```yaml
- id: via54-medit
  name: '@via54/plugin-medit'
  config:
    llm: MiniMax-M3
```

### 3. 本地集成与验证状态
- 根 workspaces 聚合构建通过：所有子包 `npm run build` 产出各自 `dist/`。
- `via54lab_core` 的 `cli` 与统一 `mcp` 入口可运行；MCP SDK 已统一到 `^1.0.0`。
- 各子包曾在本地 DeepSeek Harness 组合中挂载并探活（详见各子包 README）。

---

## 📄 开源许可
本仓库遵循 **AGPL-3.0-or-later** 许可协议。
