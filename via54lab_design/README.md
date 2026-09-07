# @via54/plugin-design

> via54Plugin 设计系统与 Bento 布局子插件

本包是 `via54Plugin` 工作区下的独立子插件，负责提供设计规范匹配与 Bento 风格格子布局的 Prompt 自动生成支持，可作为 Cordis 插件原生挂载。

## 📦 暴露能力与依赖

* **检测标识**：`design`
* **系统级二进制工具**：
  - `ffmpeg` (多媒体规范检测)
  - `mmx` (MiniMax 视觉大模型 CLI 命令行工具)
* **NPM 全局依赖**：
  - `mmx-cli` (或 `@MiniMax-AI/cli`)

## 🛠️ 安装与构建

```bash
# 进入本包目录
cd design

# 安装本包依赖
npm install

# 编译为 JS 产物
npm run build
```

## 🔌 独立部署与自检

在根目录下，您可以通过 core 管理端单独针对本插件运行自检和一键环境修复：
```bash
# 依赖环境检测
node via54lab_core/dist/cli.js check design

# 自动静默修复缺失的全局 NPM 工具
node via54lab_core/dist/cli.js deploy design -y
```
