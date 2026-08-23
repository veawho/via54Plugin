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

// 自动就地寻找脚本
const getScriptPath = () => {
  const pkgScriptPath = path.join(currentDir, 'main.js'); // 编译后的编译目录同级
  const pkgSrcScript = path.join(currentDir, '..', 'src', 'main.py');
  if (fs.existsSync(pkgSrcScript)) {
    return `"${pkgSrcScript}"`;
  }
  // 降级使用原来的外部绝对路径
  return '"C:\\Users\\via54\\Desktop\\developments\\via54Report\\src\\main.py"';
};
const reportScript = getScriptPath();

const server = new Server(
  {
    name: 'via54-report-mcp',
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
        name: 'report_fill',
        description: '使用 via54Report 提取原始数据并填写销售报表模板，自动进行数据校对',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: '本地数据源文件路径 (Excel, CSV)' },
            template: { type: 'string', description: '销售报表目标模板路径' },
            output: { type: 'string', description: '输出报表保存路径' },
          },
          required: ['source', 'template', 'output'],
        },
      },
      {
        name: 'report_verify',
        description: '使用 via54Report 对销售报表的数据进行独立、深入与全方位的逻辑校对',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: '待校对的销售报表文件路径' },
          },
          required: ['file'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'report_fill') {
      const source = args?.source as string;
      const template = args?.template as string;
      const output = args?.output as string;
      const cmd = `"${pythonPath}" ${reportScript} fill --source "${source}" --template "${template}" --output "${output}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'report_verify') {
      const file = args?.file as string;
      const cmd = `"${pythonPath}" ${reportScript} verify --file "${file}"`;
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
  console.error('[via54-report-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-report-mcp] Startup error:', err);
  process.exit(1);
});
