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
const currentDir = __dirname;

const getBinaryPath = () => {
  const isWin = process.platform === 'win32';
  const binName = isWin ? 'mmx.exe' : 'mmx';
  const pkgBinPath = path.join(currentDir, '..', 'bin', binName);
  if (fs.existsSync(pkgBinPath)) {
    return `"${pkgBinPath}"`;
  }
  // 动态解析外部绝对路径（支持 G:\agent\ai\projects 和 C:\Users\via54\Desktop\developments）
  const projectsDir = process.env.VIA54_PROJECTS_DIR || path.resolve(currentDir, '..', '..', '..');
  const fallbackPath = path.join(projectsDir, 'via54Design', 'bin', binName);
  if (fs.existsSync(fallbackPath)) {
    return `"${fallbackPath}"`;
  }
  // 降级使用硬编码的备用路径
  const hardcodedFallback = isWin ? 'C:\\Users\\via54\\Desktop\\developments\\via54Design\\bin\\mmx.exe' : 'mmx';
  return `"${hardcodedFallback}"`;
};
const mmxBin = getBinaryPath();

const server = new Server(
  {
    name: 'via54-design-mcp',
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
        name: 'design_render_pdf',
        description: '使用 mmx 渲染引擎将医学 Markdown 报告导出为高保真 PDF 报告',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Markdown 输入文件路径' },
            output: { type: 'string', description: '输出高保真 PDF 保存路径' },
          },
          required: ['input', 'output'],
        },
      },
      {
        name: 'design_compile_ppt',
        description: '使用 mmx 渲染引擎将医学大纲编译生成 PPT 演示文稿',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Markdown 输入文件路径' },
            output: { type: 'string', description: '输出 PPTX 保存路径' },
          },
          required: ['input', 'output'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'design_render_pdf') {
      const input = args?.input as string;
      const output = args?.output as string;
      const cmd = `${mmxBin} render --input "${input}" --theme cinematic-epic --output "${output}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'design_compile_ppt') {
      const input = args?.input as string;
      const output = args?.output as string;
      const cmd = `${mmxBin} compile --input "${input}" --theme cinematic-epic --output "${output}"`;
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
  const pkgConfigPath = path.join(currentDir, '..', 'config', 'config.yaml');
  const pkgDefaultConfig = path.join(currentDir, '..', 'config', 'config.default.yaml');
  const configDir = path.dirname(pkgConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(pkgConfigPath) && fs.existsSync(pkgDefaultConfig)) {
    try {
      fs.copyFileSync(pkgDefaultConfig, pkgConfigPath);
      console.error('[via54-design-mcp] 成功就地复制自愈配置文件 config.yaml');
    } catch (e) {
      console.error('[via54-design-mcp] 复制默认配置文件失败:', e);
    }
  }
}

async function main() {
  checkReadiness();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[via54-design-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-design-mcp] Startup error:', err);
  process.exit(1);
});
