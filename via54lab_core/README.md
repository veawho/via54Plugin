# @via54/plugin-core

> via54Plugin 插件框架管理核心与 MCP 服务端

本包是 `via54Plugin` 多包工作区的管理核心，负责提供统一的 MCP 服务接口和子插件运行依赖的自动检测与修复机制。

## 📦 核心功能

1. **统一 MCP 运行器 (`src/mcp.ts`)**：
   - 暴露符合 Model Context Protocol (MCP) 规范的 Stdio JSON-RPC 2.0 服务端。
   - 向 AI 客户端注册 `crawler_scrape`、`medit_ask` 和 `design_layout` 等原子工具。
   - 自动拉起对应仓库的工作脚本或二进制文件进行处理并汇总返回。

2. **自检控制台 (`src/cli.ts`)**：
   - 提供各子插件本地运行环境的依赖检验与自动化安装。
   - 扫描探测系统级命令行工具、Python 库和 NPM 全局包的安装就绪情况。

## 🛠️ 安装与构建

```bash
# 进入本包目录
cd core

# 安装本包依赖
npm install

# 编译为 JS 产物
npm run build
```

## 🔌 CLI 命令使用说明

```bash
# 检测指定插件依赖（如 medit）
node dist/cli.js check medit

# 静默修复并安装指定插件的所有缺失依赖
node dist/cli.js deploy medit -y
```
