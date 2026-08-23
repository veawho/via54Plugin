import { Context } from 'cordis';
import { DependencyMeta } from '../../core/src/types';
export declare const name = "via54-crawler";
export declare const metadata: DependencyMeta;
export interface Config {
    proxy?: string;
}
export declare function apply(ctx: Context, config: Config): void;
