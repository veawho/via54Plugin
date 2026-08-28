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

const getScriptPath = () => {
  const pkgSrcScript = path.join(currentDir, '..', 'src', 'scrape.py');
  if (fs.existsSync(pkgSrcScript)) {
    return `"${pkgSrcScript}"`;
  }
  // 动态解析外部绝对路径（支持 G:\agent\ai\projects 和 C:\Users\via54\Desktop\developments）
  const projectsDir = process.env.VIA54_PROJECTS_DIR || path.resolve(currentDir, '..', '..', '..');
  const fallbackPath = path.join(projectsDir, 'via54Crawler', 'scripts', 'scrape.py');
  if (fs.existsSync(fallbackPath)) {
    return `"${fallbackPath}"`;
  }
  // 降级使用硬编码的备用路径
  return '"C:\\Users\\via54\\Desktop\\developments\\via54Crawler\\scripts\\scrape.py"';
};
const scrapeScript = getScriptPath();

const server = new Server(
  {
    name: 'via54-crawler-mcp',
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
        name: 'crawler_scrape',
        description: '使用 via54Crawler 通用爬虫解析与抓取网页内容，支持防检测渲染',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: '需要抓取的网页 URL' },
            stealth: { type: 'boolean', description: '是否启用反指纹隐藏自动化特征 (默认 true)' },
            clean: { type: 'boolean', description: '是否启用 AI 内容清洗并输出纯净 Markdown (默认 true)' },
          },
          required: ['url'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'crawler_scrape') {
      const url = args?.url as string;
      const stealth = args?.stealth !== false ? ' --stealth' : '';
      const clean = args?.clean !== false ? ' --clean-markdown' : '';
      const cmd = `"${pythonPath}" ${scrapeScript} "${url}"${stealth}${clean}`;
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[via54-crawler-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-crawler-mcp] Startup error:', err);
  process.exit(1);
});
