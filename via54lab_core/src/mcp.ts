/**
 * mcp.ts
 * 
 * [CN] via54Plugin 统一 MCP 协议服务端程序。
 * [EN] Unified Model Context Protocol (MCP) server for via54Plugin.
 * 
 * 提供 Stdio 传输通道，暴露 crawler_scrape, medit_ask, design_layout 等核心工具给客户端。
 * Provides Stdio transport, exposing crawler_scrape, medit_ask, design_layout tools to AI clients.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const pythonPath = process.env.PYTHON || 'python';

const server = new Server(
  {
    name: 'via54-plugin-mcp',
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
        description: '使用 via54Crawler 爬取网页，支持防检测与 Playwright 自动化渲染',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: '需要爬取的网页 URL' },
          },
          required: ['url'],
        },
      },
      {
        name: 'medit_ask',
        description: '使用 via54Medit 多源循证语义路由器进行医学文献并发检索并汇总回答',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '医学临床提问或检索关键词' },
          },
          required: ['query'],
        },
      },
      {
        name: 'design_layout',
        description: '使用 via54Design 生成 Bento 格子或设计规范模板的 Prompt',
        inputSchema: {
          type: 'object',
          properties: {
            theme: { type: 'string', description: '设计主题，如 cinematic-epic, fluent-blue' },
          },
          required: ['theme'],
        },
      },
      {
        name: 'algo_llm_list',
        description: '使用 via54algo 列出所有已注册的 LLM 提供商 (20+ 渠道与 Fallback 状态)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'algo_llm_use',
        description: '使用 via54algo 热切换全局默认的大模型服务商与模型',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: '提供商，如 openai, anthropic, minimax' },
            model: { type: 'string', description: '具体的模型，如 gpt-5, claude-sonnet-4.5' },
          },
          required: ['provider', 'model'],
        },
      },
      {
        name: 'algo_llm_test',
        description: '使用 via54algo 对指定大模型提供商的 RPC 链路进行探活测试',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: '提供商，如 sensenova, openai' },
          },
          required: ['provider'],
        },
      },
      {
        name: 'larkgroups_sync',
        description: '使用 via54Larkgroups 同步过去 24 小时的飞书群组与聊天消息至本地 SQLite',
        inputSchema: {
          type: 'object',
          properties: {
            includeAttachments: { type: 'boolean', description: '是否下载附件、图片与文件' },
          },
        },
      },
      {
        name: 'larkgroups_archive',
        description: '使用 via54Larkgroups 将指定或今日日期的飞书群组消息归档导出为本地 Markdown',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: '归档的目标日期，格式为 YYYY-MM-DD' },
          },
        },
      },
      {
        name: 'larkgroups_search',
        description: '使用 via54Larkgroups 在已归档的飞书聊天 Markdown 数据库中模糊搜索关键字',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: '需要检索的字句或关键词' },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'report_fill',
        description: '使用 via54Report 提取原始数据并填写销售报表模板，自动进行数据校对',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: '本地数据源文件路径 (Excel, CSV, 图片, PDF)' },
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
      {
        name: 'crawler_pull_policies',
        description: '使用 via54Crawler 搜索引擎分级加权捕获最新的集采、医保、限价政策并暂存',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'crawler_pull_guidelines',
        description: '使用 via54Crawler 捕获最新的医学诊疗指南与文献并暂存',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'medit_medplan_market_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 PESTEL 模型的市场环境与未满足需求分析',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
          },
          required: ['project'],
        },
      },
      {
        name: 'medit_medplan_strategy_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 SWOT 模型的准入与推广策略分析',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
          },
          required: ['project'],
        },
      },
      {
        name: 'medit_medplan_marketing_analysis',
        description: '使用 via54Medit 针对特定医学策划项目进行基于 4P 模型的学术营销策划，支持结合案例库',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: '医学策略项目名称' },
            casesDb: { type: 'string', description: '（可选）营销案例库目录路径，如 via54ADIdeahub' },
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
    if (name === 'crawler_scrape') {
      const url = args?.url as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Crawler\\scripts\\scrape.py "${url}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medit_ask') {
      const query = args?.query as string;
      const cmd = `C:\\Users\\via54\\Desktop\\developments\\via54Medit\\medit.exe ask "${query}" --json`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'design_layout') {
      const theme = args?.theme as string;
      const cmd = `C:\\Users\\via54\\Desktop\\developments\\via54Design\\via54.exe prompt --scene "${theme}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    // --- algo 插件能力组 ---
    if (name === 'algo_llm_list') {
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54algo\\algorithm\\cli\\__main__.py llm list`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'algo_llm_use') {
      const provider = args?.provider as string;
      const model = args?.model as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54algo\\algorithm\\cli\\__main__.py llm use "${provider}" "${model}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'algo_llm_test') {
      const provider = args?.provider as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54algo\\algorithm\\cli\\__main__.py llm test "${provider}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    // --- larkgroups 插件能力组 ---
    if (name === 'larkgroups_sync') {
      const includeAttachments = !!args?.includeAttachments;
      const attachFlag = includeAttachments ? ' --include-attachments' : '';
      // 使用 -y 参数实现静默，防交互拦截
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Larkgroups\\src\\via54_larkgroups\\__main__.py sync${attachFlag} -y`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'larkgroups_archive') {
      const date = args?.date as string;
      const dateFlag = date ? ` --date "${date}"` : '';
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Larkgroups\\src\\via54_larkgroups\\__main__.py archive${dateFlag}`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'larkgroups_search') {
      const keyword = args?.keyword as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Larkgroups\\src\\via54_larkgroups\\__main__.py search --keyword "${keyword}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'report_fill') {
      const source = args?.source as string;
      const template = args?.template as string;
      const output = args?.output as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Report\\src\\main.py fill --source "${source}" --template "${template}" --output "${output}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'report_verify') {
      const file = args?.file as string;
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Report\\src\\main.py verify --file "${file}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'crawler_pull_policies') {
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Crawler\\scripts\\pull_pricing_policies.py`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'crawler_pull_guidelines') {
      const cmd = `"${pythonPath}" C:\\Users\\via54\\Desktop\\developments\\via54Crawler\\scripts\\pull_medical_guidelines.py`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medit_medplan_market_analysis') {
      const project = args?.project as string;
      const cmd = `C:\\Users\\via54\\Desktop\\developments\\via54Medit\\medit.exe medplan market-analysis "${project}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medit_medplan_strategy_analysis') {
      const project = args?.project as string;
      const cmd = `C:\\Users\\via54\\Desktop\\developments\\via54Medit\\medit.exe medplan strategy-analysis "${project}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'medit_medplan_marketing_analysis') {
      const project = args?.project as string;
      const casesDb = args?.casesDb as string;
      const dbFlag = casesDb ? ` --cases-db "${casesDb}"` : '';
      const cmd = `C:\\Users\\via54\\Desktop\\developments\\via54Medit\\medit.exe medplan marketing-analysis "${project}"${dbFlag}`;
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
  console.error('[via54-plugin-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-plugin-mcp] Startup error:', err);
  process.exit(1);
});
