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
  const binName = isWin ? 'medit.exe' : 'medit';
  const pkgBinPath = path.join(currentDir, '..', 'bin', binName);
  if (fs.existsSync(pkgBinPath)) {
    return `"${pkgBinPath}"`;
  }
  // 动态解析外部绝对路径（支持 G:\agent\ai\projects 和 C:\Users\via54\Desktop\developments）
  const projectsDir = process.env.VIA54_PROJECTS_DIR || path.resolve(currentDir, '..', '..', '..');
  const fallbackPath = path.join(projectsDir, 'via54Medit', binName);
  if (fs.existsSync(fallbackPath)) {
    return `"${fallbackPath}"`;
  }
  // 降级使用硬编码的备用路径
  const hardcodedFallback = isWin ? 'C:\\Users\\via54\\Desktop\\developments\\via54Medit\\medit.exe' : 'medit';
  return `"${hardcodedFallback}"`;
};
const meditBin = getBinaryPath();

const server = new Server(
  {
    name: 'via54-medit-mcp',
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
        name: 'medplan_market_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 PESTEL 模型的市场环境与未满足需求分析报告撰写',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
            runEbmRouter: { type: 'boolean', description: '（可选）是否前置启动文献路由器在 PubMed/OpenAlex 检索真实数据 (默认 false)' },
          },
          required: ['project'],
        },
      },
      {
        name: 'medplan_strategy_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 SWOT 模型的准入与推广策略分析报告撰写',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
            runEbmRouter: { type: 'boolean', description: '（可选）是否前置启动文献路由器在 PubMed/OpenAlex 检索真实数据 (默认 false)' },
          },
          required: ['project'],
        },
      },
      {
        name: 'medplan_marketing_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 4P 模型的学术营销策划报告撰写，支持结合案例库与循证文献',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
            casesDb: { type: 'string', description: '（可选）营销案例库目录路径，如 via54ADIdeahub' },
            runEbmRouter: { type: 'boolean', description: '（可选）是否前置启动文献路由器在 PubMed/OpenAlex 检索真实数据 (默认 false)' },
          },
          required: ['project'],
        },
      },
      {
        name: 'medplan_compliance',
        description: '使用 via54Medit 对生成的策略报告实施中国医疗广告/准入法规及26个文献引用避坑规则审计',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
            audience: { type: 'string', description: '（可选）目标受众 hcp/patient/industry/all (默认 all)' },
            checkPitfalls: { type: 'boolean', description: '（可选）是否开启26项学术引用缺陷与数据造假专项审查 (默认 true)' },
          },
          required: ['project'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'medplan_market_analysis') {
      const project = args?.project as string;
      const runEbm = !!args?.runEbmRouter;
      const ebmFlag = runEbm ? ' --skip-research=false --sources=pubmed,openalex,s2' : ' --skip-research=true';
      const cmd = `${meditBin} medplan market-analysis "${project}"${ebmFlag}`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medplan_strategy_analysis') {
      const project = args?.project as string;
      const runEbm = !!args?.runEbmRouter;
      const ebmFlag = runEbm ? ' --skip-research=false --sources=pubmed,openalex,s2' : ' --skip-research=true';
      const cmd = `${meditBin} medplan strategy-analysis "${project}"${ebmFlag}`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medplan_marketing_analysis') {
      const project = args?.project as string;
      const casesDb = args?.casesDb as string;
      const runEbm = !!args?.runEbmRouter;
      const dbFlag = casesDb ? ` --cases-db "${casesDb}"` : '';
      const ebmFlag = runEbm ? ' --skip-research=false --sources=pubmed,openalex,s2' : ' --skip-research=true';
      const cmd = `${meditBin} medplan marketing-analysis "${project}"${dbFlag}${ebmFlag}`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medplan_compliance') {
      const project = args?.project as string;
      const audience = (args?.audience as string) || 'all';
      const checkPit = args?.checkPitfalls !== false;
      const pitFlag = checkPit ? ' --check-pitfalls' : '';
      const cmd = `${meditBin} medplan compliance "${project}" --audience "${audience}"${pitFlag}`;
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

// 配置自愈与环境变量卫哨
function checkReadiness() {
  const pkgConfigPath = path.join(currentDir, '..', 'config', 'config.yaml');
  const pkgDefaultConfig = path.join(currentDir, '..', 'config', 'config.default.yaml');
  if (!fs.existsSync(pkgConfigPath) && fs.existsSync(pkgDefaultConfig)) {
    try {
      fs.copyFileSync(pkgDefaultConfig, pkgConfigPath);
      console.error('[via54-medit-mcp] 成功就地复制自愈配置文件 config.yaml');
    } catch (e) {
      console.error('[via54-medit-mcp] 复制默认配置文件失败:', e);
    }
  }

  // 环境变量卫哨
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('⚠️ [via54-medit-mcp] 警告: 未检测到环境变量 DEEPSEEK_API_KEY！学术 RAG 分析和合规审查可能无法正常工作。请在启动前配妥此变量。');
  }
}

async function main() {
  checkReadiness();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[via54-medit-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-medit-mcp] Startup error:', err);
  process.exit(1);
});
