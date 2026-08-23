export interface DependencyMeta {
  name: string;
  systemBinaries: string[];   // 系统命令行工具
  pythonModules: string[];    // Python 依赖库包
  npmGlobals: string[];       // npm 全局依赖包
}

export interface PluginModule {
  name: string;
  metadata: DependencyMeta;
  apply: (ctx: any, config: any) => void;
}
