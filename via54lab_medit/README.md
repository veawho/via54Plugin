# @via54/plugin-medit

> via54Plugin 医学循证路由子插件

本包是 `via54Plugin` 工作区下的独立子插件，负责提取医学多源文献检索、PICO 证据分析与 GRADE 质量评估核心路由功能，可作为 Cordis 插件原生挂载。

## 📦 暴露能力与依赖

* **检测标识**：`medit`
* **系统级二进制工具**：
  - `pdftotext` (PDF 文本转换)
  - `lark-cli` (飞书集成 CLI)
* **Python 依赖库**：
  - `fitz` (PyMuPDF - 文献解析)
  - `python-pptx` (幻灯片结构生成)
  - `Pillow` (PIL - 图像验证处理)
* **NPM 全局依赖**：
  - `@larksuite/cli`

## 🛠️ 安装与构建

```bash
# 进入本包目录
cd medit

# 安装本包依赖
npm install

# 编译为 JS 产物
npm run build
```

## 🔌 独立部署与自检

在根目录下，您可以通过 core 管理端单独针对本插件运行自检和一键环境修复：
```bash
# 依赖环境检测
node via54lab_core/dist/cli.js check medit

# 自动静默修复缺失的依赖包 (Python / NPM)
node via54lab_core/dist/cli.js deploy medit -y
```
