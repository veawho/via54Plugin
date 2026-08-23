import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-medfeed';

export const metadata: DependencyMeta = {
  name: 'medfeed',
  systemBinaries: [],
  pythonModules: ['requests', 'urllib3'], // 医学整理所需的标准及网络依赖库
  npmGlobals: []
};

export interface Config {
  channels?: string[]; // 回报的渠道，如 feishu, telegram, mail
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Medfeed] Cordis 挂载成功，摘要汇报渠道:', config.channels?.join(',') || '未指定');
  });
}
