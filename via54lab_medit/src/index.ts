import { Context } from 'cordis';

export interface DependencyMeta {
  name: string;
  systemBinaries: string[];
  pythonModules: string[];
  npmGlobals: string[];
}

export const name = 'via54-medit';

export const metadata: DependencyMeta = {
  name: 'medit',
  systemBinaries: ['pdftotext', 'lark-cli'],
  pythonModules: ['fitz', 'pptx', 'PIL'],
  npmGlobals: ['@larksuite/cli']
};

export interface Config {
  llm?: string;
}

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    console.log('[via54Plugin-Medit] Cordis 挂载成功，模型配置:', config.llm || 'hermes');
  });
}
