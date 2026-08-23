import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';
import { DependencyMeta } from './types';

const execAsync = promisify(exec);
const pythonPath = process.env.PYTHON || 'python';

// 直接定义各子插件的依赖元数据，彻底解耦 TypeScript 编译依赖
const pluginRegistry: Record<string, DependencyMeta> = {
  crawler: {
    name: 'crawler',
    systemBinaries: [],
    pythonModules: ['crawl4ai', 'browser_use'],
    npmGlobals: [],
  },
  medit: {
    name: 'medit',
    systemBinaries: ['pdftotext', 'lark-cli'],
    pythonModules: ['fitz', 'pptx', 'PIL'],
    npmGlobals: ['@larksuite/cli'],
  },
  design: {
    name: 'design',
    systemBinaries: ['ffmpeg', 'mmx'],
    pythonModules: [],
    npmGlobals: ['mmx-cli'],
  },
  algo: {
    name: 'algo',
    systemBinaries: [],
    pythonModules: ['redis', 'lancedb', 'pyarrow', 'numpy', 'sklearn'],
    npmGlobals: [],
  },
  larkgroups: {
    name: 'larkgroups',
    systemBinaries: ['feishu-vault'],
    pythonModules: [],
    npmGlobals: [],
  },
  report: {
    name: 'report',
    systemBinaries: [],
    pythonModules: ['pandas', 'openpyxl', 'click'],
    npmGlobals: [],
  },
};

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkSystemBinary(binary: string): Promise<boolean> {
  const cmd = process.platform === 'win32' ? `where.exe ${binary}` : `which ${binary}`;
  try {
    await execAsync(cmd);
    return true;
  } catch {
    // 降级检查：如果二进制文件存在于 Python 虚拟环境的 Scripts 目录下，同样判定为就绪
    const path = require('path');
    const fs = require('fs');
    const pyDir = path.dirname(pythonPath);
    const binName = process.platform === 'win32' ? `${binary}.exe` : binary;
    const localBinPath = path.join(pyDir, binName);
    if (fs.existsSync(localBinPath)) {
      return true;
    }
    return false;
  }
}

async function checkPythonModule(module: string): Promise<boolean> {
  try {
    await execAsync(`"${pythonPath}" -c "import ${module}"`);
    return true;
  } catch {
    return false;
  }
}

async function checkNpmGlobal(pkg: string): Promise<boolean> {
  try {
    await execAsync(`npm list -g --depth=0 ${pkg}`);
    return true;
  } catch {
    return false;
  }
}

async function runCheck(pluginName: string): Promise<{
  meta: DependencyMeta;
  missingBinaries: string[];
  missingPython: string[];
  missingNpm: string[];
}> {
  const meta = pluginRegistry[pluginName];
  if (!meta) {
    throw new Error(`未找到名为 "${pluginName}" 的插件。可选插件: ${Object.keys(pluginRegistry).join(', ')}`);
  }

  console.log(`\n🔍 开始检测插件 [${meta.name}] 的运行依赖...`);
  console.log(`💻 当前 Python 解释器: ${pythonPath}\n`);

  const missingBinaries: string[] = [];
  const missingPython: string[] = [];
  const missingNpm: string[] = [];

  for (const bin of meta.systemBinaries) {
    const ok = await checkSystemBinary(bin);
    if (ok) {
      console.log(`  ✓ 系统工具: ${bin} (已就绪)`);
    } else {
      console.log(`  ✗ 系统工具: ${bin} (未安装)`);
      missingBinaries.push(bin);
    }
  }

  for (const py of meta.pythonModules) {
    const ok = await checkPythonModule(py);
    if (ok) {
      console.log(`  ✓ Python 库: ${py} (已就绪)`);
    } else {
      console.log(`  ✗ Python 库: ${py} (未安装)`);
      missingPython.push(py);
    }
  }

  for (const pkg of meta.npmGlobals) {
    const ok = await checkNpmGlobal(pkg);
    if (ok) {
      console.log(`  ✓ NPM 全局包: ${pkg} (已就绪)`);
    } else {
      console.log(`  ✗ NPM 全局包: ${pkg} (未安装)`);
      missingNpm.push(pkg);
    }
  }

  return { meta, missingBinaries, missingPython, missingNpm };
}

async function runDeploy(pluginName: string) {
  const { meta, missingBinaries, missingPython, missingNpm } = await runCheck(pluginName);

  const totalMissing = missingBinaries.length + missingPython.length + missingNpm.length;
  if (totalMissing === 0) {
    console.log(`\n🎉 插件 [${meta.name}] 所有依赖均已满足，部署完成，可立即投入使用！\n`);
    return;
  }

  console.log(`\n⚠️ 发现缺少 ${totalMissing} 项依赖关系。`);

  const autoYes = process.argv.includes('-y') || process.argv.includes('--yes');
  if (!autoYes) {
    const installAns = await askQuestion('❓ 是否尝试自动为您安装和部署缺少的依赖包？(y/n): ');
    if (installAns.toLowerCase() !== 'y' && installAns.toLowerCase() !== 'yes') {
      console.log('\n❌ 用户取消了自动部署。请手动补齐上述缺失工具。');
      return;
    }
  } else {
    console.log('\n⚡ 检测到 -y / --yes 参数，正在自动执行静默部署安装...');
  }

  if (missingPython.length > 0) {
    console.log('\n📥 正在安装缺少的 Python 模块...');
    for (const py of missingPython) {
      try {
        console.log(`⚡ 运行: pip install ${py}...`);
        await execAsync(`"${pythonPath}" -m pip install ${py}`);
        console.log(`  ✓ 成功安装 Python 模块: ${py}`);
      } catch (err: any) {
        console.error(`  ✗ 安装 Python 模块 ${py} 失败: ${err.message}`);
      }
    }
  }

  if (missingNpm.length > 0) {
    console.log('\n📥 正在安装缺少的 NPM 全局工具...');
    for (const pkg of missingNpm) {
      try {
        console.log(`⚡ 运行: npm install -g ${pkg}...`);
        await execAsync(`npm install -g ${pkg}`);
        console.log(`  ✓ 成功安装 NPM 包: ${pkg}`);
      } catch (err: any) {
        console.error(`  ✗ 安装 NPM 包 ${pkg} 失败: ${err.message}`);
      }
    }
  }

  if (missingBinaries.length > 0) {
    console.log('\n📢 注意: 存在缺失的系统级命令行工具，请参考以下方式手动安装:');
    for (const bin of missingBinaries) {
      if (bin === 'pdftotext') {
        console.log(`  - pdftotext: 请使用 Windows Scoop 安装: "scoop install poppler" 或 macOS: "brew install poppler"`);
      } else if (bin === 'lark-cli') {
        console.log(`  - lark-cli: 推荐运行: "npm install -g @larksuite/cli"`);
      } else if (bin === 'mmx') {
        console.log(`  - mmx: 推荐运行: "npm install -g @MiniMax-AI/cli"`);
      } else {
        console.log(`  - ${bin}: 请使用您系统的包管理器 (scoop, brew, apt) 进行安装。`);
      }
    }
  }

  console.log(`\n🎉 自动部署命令执行完毕，请重新运行 "node core/dist/cli.js check ${pluginName}" 验证。\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const target = args[1];

  if (!action || !target || (action !== 'check' && action !== 'deploy')) {
    console.log(`
用法:
  node core/dist/cli.js check <plugin>   - 检测指定插件的运行依赖状态
  node core/dist/cli.js deploy <plugin>  - 检测并自动下载安装缺失的依赖

可选插件:
  crawler    - 网页爬虫插件
  medit      - 医学循证路由插件
  design     - 布局与设计模板插件
  algo       - 算法路由器与LLM配置管理插件
  larkgroups - 飞书群组消息归档同步插件
  report     - 销售报表自动填写与深度校对插件

示例:
  node core/dist/cli.js check medit
  node core/dist/cli.js deploy medit
`);
    return;
  }

  try {
    if (action === 'check') {
      await runCheck(target);
    } else if (action === 'deploy') {
      await runDeploy(target);
    }
  } catch (err: any) {
    console.error(`\n❌ 执行失败: ${err.message}\n`);
    process.exit(1);
  }
}

main();
