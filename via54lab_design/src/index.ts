import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-design';

export const metadata: DependencyMeta = {
  name: 'design',
  systemBinaries: ['ffmpeg', 'mmx'],
  pythonModules: [],
  npmGlobals: ['mmx-cli']
};

export interface Config {
  theme?: string;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Design] Cordis 挂载成功，设计主题:', config.theme || 'cinematic-epic');
  });
}
