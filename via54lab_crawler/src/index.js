"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = exports.name = void 0;
exports.apply = apply;
exports.name = 'via54-crawler';
exports.metadata = {
    name: 'crawler',
    systemBinaries: [],
    pythonModules: ['crawl4ai', 'browser_use'],
    npmGlobals: []
};
function apply(ctx, config) {
    ctx.on('ready', () => {
        console.log('[via54Plugin-Crawler] Cordis 挂载成功，代理设置:', config.proxy || '无');
    });
}
