"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = exports.name = void 0;
exports.apply = apply;
exports.name = 'via54-medit';
exports.metadata = {
    name: 'medit',
    systemBinaries: ['pdftotext', 'lark-cli'],
    pythonModules: ['fitz', 'pptx', 'PIL'],
    npmGlobals: ['@larksuite/cli']
};
function apply(ctx, config) {
    ctx.on('ready', () => {
        console.log('[via54Plugin-Medit] Cordis 挂载成功，模型配置:', config.llm || 'hermes');
    });
}
