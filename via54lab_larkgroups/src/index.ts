import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-larkgroups';

export const metadata: DependencyMeta = {
  name: 'larkgroups',
  systemBinaries: ['feishu-vault'],
  pythonModules: [],
  npmGlobals: []
};

export interface Config {
  autoSync?: boolean;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Larkgroups] Cordis 挂载成功，自动同步状态:', config.autoSync ? '已开启' : '已关闭');
  });
}
