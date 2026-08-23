export interface DependencyMeta {
    name: string;
    systemBinaries: string[];
    pythonModules: string[];
    npmGlobals: string[];
}
export interface PluginModule {
    name: string;
    metadata: DependencyMeta;
    apply: (ctx: any, config: any) => void;
}
