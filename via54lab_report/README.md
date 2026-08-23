# @via54/plugin-report — 销售报表子插件

本项目是销售报表自动填写与全面深度校对的独立子插件。它可以作为 `DeepSeek harness` 的 Cordis 插件原生挂载，同时也为 IDE 客户端提供 MCP 功能接口。

## 📋 主要功能

- 挂载后通过 CLI/MCP 提供销售报表的数据抽取、模板填写及深度校对指令；
- 支持检测所需的 `pandas`、`openpyxl` 及 `click` 环境库。

## 🔌 DeepSeek harness 配置

```yaml
plugins:
  via54-report:
    deepCheck: true
```
