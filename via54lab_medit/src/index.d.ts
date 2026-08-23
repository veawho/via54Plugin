import { Context } from 'cordis';
import { DependencyMeta } from '../../core/src/types';
export declare const name = "via54-medit";
export declare const metadata: DependencyMeta;
export interface Config {
    llm?: string;
}
export declare function apply(ctx: Context, config: Config): void;
