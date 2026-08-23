import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-algo';

export const metadata: DependencyMeta = {
  name: 'algo',
  systemBinaries: ['via54algo'],
  pythonModules: ['redis', 'lancedb', 'pyarrow', 'numpy', 'scikit-learn'],
  npmGlobals: []
};

export interface Config {
  redisUrl?: string;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Algo] Cordis 挂载成功，Redis 连接配置:', config.redisUrl || 'redis://localhost:6379');
  });
}
