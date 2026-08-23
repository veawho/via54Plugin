import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-crawler';

export const metadata: DependencyMeta = {
  name: 'crawler',
  systemBinaries: [],
  pythonModules: ['crawl4ai', 'browser_use'],
  npmGlobals: []
};

export interface Config {
  proxy?: string;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Crawler] Cordis 挂载成功，代理设置:', config.proxy || '无');
  });
}
