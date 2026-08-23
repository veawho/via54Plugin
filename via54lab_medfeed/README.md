# @via54/plugin-medfeed — 医学整理与归档子插件

本项目是医学特定领域的“信息捕捉+OKF存档+摘要回报”独立子插件。它可以作为 `DeepSeek harness` 的 Cordis 插件原生挂载，同时也为 IDE 客户端提供 MCP 功能接口。

## 📋 主要功能

- 挂载后通过 CLI/MCP 提供医学领域的集采、医保、限价政策的加权捕获；
- 支持抓取并将数据自动归档为 Google OKF (Open Knowledge Format) 格式；
- 预留多渠道（微信/Telegram/飞书/邮件）摘要回报分发接口。

## 🔌 客户端 MCP 配置

```json
"via54-medfeed-mcp": {
  "command": "node",
  "args": ["C:/Users/via54/Desktop/developments/via54Plugin/via54lab_medfeed/dist/mcp.js"]
}
```
