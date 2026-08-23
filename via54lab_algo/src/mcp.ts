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

// 自动就地寻找处理器脚本
const getScriptPath = () => {
  const pkgSrcScript = path.join(currentDir, '..', 'src', 'selfgrow.py');
  if (fs.existsSync(pkgSrcScript)) {
    return `"${pkgSrcScript}"`;
  }
  // 降级使用原来的外部绝对路径
  return '"C:\\Users\\via54\\Desktop\\developments\\via54Plugin\\via54lab_algo\\src\\selfgrow.py"';
};
const algoScript = getScriptPath();

const server = new Server(
  {
    name: 'via54-algo-mcp',
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
        name: 'algo_scan_environment',
        description: '扫描读取部署设备上的所有挂载的 mcp 工具、AI大模型及硬件（CPU/GPU）性能状态',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'algo_optimize_workflow',
        description: '根据自然语言任务目标，动态优化编排 LLM 的 System Prompt 工作流提示词',
        inputSchema: {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '待执行的自然语言任务目标' },
            currentPrompt: { type: 'string', description: '当前的 LLM 提示词' },
          },
          required: ['goal', 'currentPrompt'],
        },
      },
      {
        name: 'algo_self_iterate',
        description: '根据用户对任务完成质量的打分与自然语言反馈，执行算法自生成自学习自愈迭代',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: '任务 ID' },
            score: { type: 'number', description: '本次任务评分（1.0 - 10.0）' },
            feedback: { type: 'string', description: '（可选）自然语言反馈意见' },
          },
          required: ['taskId', 'score'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'algo_scan_environment') {
      const cmd = `"${pythonPath}" ${algoScript} scan`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'algo_optimize_workflow') {
      const goal = args?.goal as string;
      const currentPrompt = args?.currentPrompt as string;
      const payload = JSON.stringify({ goal, current_prompt: currentPrompt }).replace(/"/g, '\\"');
      
      const cmd = `"${pythonPath}" ${algoScript} optimize --data "${payload}"`;
      const { stdout } = await execAsync(cmd);
      return {
        content: [{ type: 'text', text: stdout }],
      };
    }

    if (name === 'algo_self_iterate') {
      const taskId = args?.taskId as string;
      const score = args?.score as number;
      const feedback = (args?.feedback as string) || '';
      const payload = JSON.stringify({ task_id: taskId, score, feedback }).replace(/"/g, '\\"');
      
      const cmd = `"${pythonPath}" ${algoScript} iterate --data "${payload}"`;
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
      console.error('[via54-algo-mcp] 成功就地复制自愈配置文件 config.yaml');
    } catch (e) {
      console.error('[via54-algo-mcp] 复制默认配置文件失败:', e);
    }
  }
}

async function main() {
  checkReadiness();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[via54-algo-mcp] Server running on stdio');
}

main().catch((err) => {
  console.error('[via54-algo-mcp] Startup error:', err);
  process.exit(1);
});
