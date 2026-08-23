import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-report';

export const metadata: DependencyMeta = {
  name: 'report',
  systemBinaries: [],
  pythonModules: ['pandas', 'openpyxl', 'click'],
  npmGlobals: []
};

export interface Config {
  deepCheck?: boolean;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Report] Cordis 挂载成功，深度校验开启状态:', config.deepCheck !== false ? '是' : '否');
  });
}
