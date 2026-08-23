"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = exports.name = void 0;
exports.apply = apply;
exports.name = 'via54-design';
exports.metadata = {
    name: 'design',
    systemBinaries: ['ffmpeg', 'mmx'],
    pythonModules: [],
    npmGlobals: ['mmx-cli']
};
function apply(ctx, config) {
    ctx.on('ready', () => {
        console.log('[via54Plugin-Design] Cordis 挂载成功，设计主题:', config.theme || 'cinematic-epic');
    });
}
