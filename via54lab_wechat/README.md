# via54Plugin - 微信公众号文章解析子插件 (wechat-parser)

这是一个完全独立的微信公众号文章解析插件，既可以作为独立的 **CLI 命令行工具** 运行，也可以作为标准的 **MCP (Model Context Protocol) 服务** 或 **DeepSeek-harness (Cordis) 插件** 运行。

本项目已被设计为 **100% 自包含**，不依赖单体仓库中的其他子项目，支持在任何机器上进行独立部署和使用。

---

## 🛠️ 独立部署步骤 (Deployment)

1. **提取插件目录**：
   将 `via54lab_wechat` 文件夹复制到目标部署环境。

2. **安装依赖**：
   在插件根目录下运行（如果是在 workspaces 仓库中，添加 `--no-workspaces` 参数以防止父工作区干扰）：
   ```bash
   npm install --no-workspaces
   ```

3. **编译构建**：
   ```bash
   npm run build
   ```
   编译成功后，产物将生成在 `dist` 目录下。

---

## 🚀 独立使用方式 (Usage)

### 1. 命令行直接解析 (CLI)
执行以下命令直接在终端解析微信文章并输出可读排版，或者使用 `--json` / `-j` 选项输出结构化 JSON：
```bash
# 可读 Markdown 排版输出
npm run start:cli -- "https://mp.weixin.qq.com/s/xxxxxx"

# 结构化 JSON 格式输出
npm run start:cli -- "https://mp.weixin.qq.com/s/xxxxxx" --json
```

### 2. 作为独立的 MCP 服务器使用 (Stdio Mode)
您可以将此插件单独注册为任何支持 MCP 的 AI 客户端（如 Antigravity, Claude Code, Trae 等）的服务端：

在客户端的 `mcp_config.json` 中配置：
```json
{
  "mcpServers": {
    "wechat-parser": {
      "command": "node",
      "args": ["/path/to/via54lab_wechat/dist/mcp/server.js"]
    }
  }
}
```

### 3. 作为 Cordis 插件使用 (DeepSeek-harness)
在 `DeepSeek_harness` 的配置文件中以声明式形式加载插件主入口：
```yaml
plugins:
  "/path/to/via54lab_wechat/dist/dsh/plugin.js": {}
```

---

## 🔬 解析策略与智能兜底
- **本地 Cheerio 解析**：对页面请求进行客户端 User-Agent 伪装，利用规则解析器高速、无环境要求地拉取文章正文。
- **Jina Reader 云端中转兜底**：当本地请求触发微信验证码拦截、频率限制或网络超时时，系统会自动无缝切换至 Jina Reader API 进行解析，保证极高解析成功率。
