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

为了支持**物理隔离部署**和**精简依赖拉取**，本项目采用了标准的 **npm workspaces** 扁平单体包结构。

---

## 📁 目录结构与插件矩阵

各插件以独立子包（Sub-package）的形式扁平化存放在根目录下，拥有独立的 `package.json` 和构建上下文：

```
via54Plugin/ (根目录)
├── package.json (全局工作区管理)
├── README.md (根说明文档)
├── LICENSE (许可协议)
├── via54lab_core/ (统一管理中心)
│   ├── package.json
│   ├── src/mcp.ts (统一 MCP 协议服务端)
│   └── src/cli.ts (多插件自检与修复控制台)
├── via54lab_crawler/ (网页爬虫插件)
│   ├── package.json
│   └── src/index.ts (防检测 Playwright 网页爬取模块)
├── via54lab_medit/ (医学路由插件)
│   ├── package.json
│   └── src/index.ts (医学循证、PICO 检索模块)
├── via54lab_design/ (设计系统插件)
│   ├── package.json
│   └── src/index.ts (Bento 风格布局 Prompt 发生器模块)
├── via54lab_algo/ (算法路由插件)
│   ├── package.json
│   └── src/index.ts (算法分流路由适配模块)
└── via54lab_larkgroups/ (群消息同步插件)
    ├── package.json
    └── src/index.ts (飞书群组消息持久化存储模块)
```

---

## 🛠️ 安装与构建

### 1. 全局工作区引导与编译
在仓库根目录下运行以下命令，npm 会自动解析并建立工作区间（Workspaces）的本地链接，并并发编译所有包：
```bash
# 安装并链接所有插件依赖
npm install

# 编译构建所有子插件的 JS 产物
npm run build
```

### 2. 独立包稀疏检出与部署
如果您只需要在目标设备上单独部署某一个特定的插件（例如 `medit`），可利用 Git 稀疏检出（Sparse Checkout）仅拉取特定包，以防污染和占用多余磁盘空间：
```bash
git clone --no-checkout https://github.com/veawho/via54Plugin.git
cd via54Plugin
git sparse-checkout set via54lab_core via54lab_medit
git checkout
cd via54lab_medit && npm install
```

---

## 🔍 依赖自检与无人值守修复机制

每个独立插件声明了其所需的系统工具（二进制）、Python 库和全局 NPM 包。您可以使用统一的命令行，在部署阶段进行自动环境校验：

```bash
# 1. 检测 medit 插件所需的本地依赖状态 (pdftotext, lark-cli, PIL 等)
npm run plugin:check -- medit

# 2. 静默安装与修复 medit 缺失 of 包 (加 -y / --yes 可实现完全无人值守静默部署)
npm run plugin:deploy -- medit -y
```

可选检测插件目标：`crawler`、`medit`、`design`、`algo`、`larkgroups`。

---

## 🔌 客户端集成配置

### 1. 作为 MCP 服务器加载 (适用于 Antigravity / Claude Code 等)
在您的客户端配置文件（如 `config.json` 或 `mcp_config.json`）中添加以下 Stdio 服务端配置，直接调用 `via54lab_core` 包的编译产物：

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

### 2. 作为 Cordis 插件加载 (适用于 DeepSeek Harness)
在 `DeepSeek_harness` 的配置文件中以声明式形式加载各子插件模块：
```yaml
plugins:
  via54-medit:
    llm: "MiniMax-M3"
  via54-crawler:
    proxy: "http://localhost:1080"
```

---

## 📄 开源许可
本仓库遵循 **AGPL-3.0-or-later** 许可协议。
