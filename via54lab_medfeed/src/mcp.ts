import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
const execAsync = promisify(exec);
const pythonPath = process.env.PYTHON || 'python';
const currentDir = __dirname;

const getScriptPath = (scriptName: string) => {
  const pkgSrcScript = path.join(currentDir, '..', 'src', scriptName);
  if (fs.existsSync(pkgSrcScript)) {
    return `"${pkgSrcScript}"`;
  }
  // 动态解析外部绝对路径（支持 G:\agent\ai\projects 和 C:\Users\via54\Desktop\developments）
  const projectsDir = process.env.VIA54_PROJECTS_DIR || path.resolve(currentDir, '..', '..', '..');
  const fallbackPath = path.join(projectsDir, 'via54Crawler', 'scripts', scriptName);
  if (fs.existsSync(fallbackPath)) {
    return `"${fallbackPath}"`;
  }
  // 降级使用硬编码的备用路径
  return `"C:\\Users\\via54\\Desktop\\developments\\via54Crawler\\scripts\\${scriptName}"`;
};
const policyScript = getScriptPath('pull_pricing_policies.py');
const guidelineScript = getScriptPath('pull_medical_guidelines.py');

const server = new Server(
  {
    name: 'via54-medfeed-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'medfeed_pull_policies',
        description: '使用医学整理工具搜索引擎分级加权捕获集采/医保/价格政策并归档为 OKF 格式',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'medfeed_pull_guidelines',
        description: '使用医学整理工具抓取最新文献与诊疗指南并归档为 OKF 格式',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'medfeed_pull_policies') {
      const cmd = `"${pythonPath}" ${policyScript} --enable-proxy-pool --archive-okf`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medfeed_pull_guidelines') {
      const cmd = `"${pythonPath}" ${guidelineScript} --enable-proxy-pool --archive-okf`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    throw new Error(`未知工具: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `调用失败: ${error.message}` }],
      isError: true,
    };
  }
});

// 配置自愈
function checkReadiness() {
  const pkgConfigPath = path.join(currentDir, '..', 'config', 'proxy.yaml');
  const pkgDefaultConfig = path.join(currentDir, '..', 'config', 'config.default.yaml');
  // 如果当前没有配置目录，建立它
  const configDir = path.dirname(pkgConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(pkgConfigPath) && fs.existsSync(pkgDefaultConfig)) {
    try {
      fs.copyFileSync(pkgDefaultConfig, pkgConfigPath);
      console.error('[via54-medfeed-mcp] 成功就地复制自愈配置文件 proxy.yaml');
    } catch (e) {
      console.error('[via54-medfeed-mcp] 复制默认配置文件失败:', e);
    }
  }
}

async function main() {
  checkReadiness();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[via54-medfeed-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-medfeed-mcp] Startup error:', err);
  process.exit(1);
});
