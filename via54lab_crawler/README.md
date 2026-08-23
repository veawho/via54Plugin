# @via54/plugin-crawler

> via54Plugin 网页爬取子插件

本包是 `via54Plugin` 工作区下的独立子插件，负责提供防检测的 Playwright 自动化网页数据爬取与解析功能，可作为 Cordis 插件原生挂载。

## 📦 暴露能力与依赖

* **检测标识**：`crawler`
* **Python 依赖库**：
  - `crawl4ai` (主爬取模块)
  - `browser-use` (自动化浏览器操控)

## 🛠️ 安装与构建

```bash
# 进入本包目录
cd crawler

# 安装本包依赖
npm install

# 编译为 JS 产物
npm run build
```

## 🔌 独立部署与自检

在根目录下，您可以通过 core 管理端单独针对本插件运行自检和一键环境修复：
```bash
# 依赖环境检测
npm run plugin:check -- crawler

# 自动静默修复缺失的 Python 库等依赖
npm run plugin:deploy -- crawler -y
```
