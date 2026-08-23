---
name: via54design-skill
description: High-fidelity medical presentation (PPT/PDF) rendering guidelines - using local mmx engine to format Markdown strategy documents to slides.
version: 1.0.0
---

# via54design · 医学学术报告高保真渲染技能

> 使用本地内置的 mmx 渲染引擎，将 Markdown 文本自动排版编译生成符合 16:9 学术演示规格的 PPT 或 PDF 文件。

## When to Use

Use when:
- Exporting medical SWOT/PESTEL report documents to high-fidelity PDF slides.
- Compiling outline points into PPT presentations.
- Automatic typography adjustments using cinematic-epic presets.

## Implementation Guide

1. Initiate the local mmx engine via CLI:
```bash
# Render markdown reports into PDF slides
bin/mmx.exe render --input report.md --theme cinematic-epic --output slides.pdf
```

2. Format of slide layout:
- Page splits are demarcated by `---` (horizontal rules).
- Heading `# ` matches slide title.
- Bullets `- ` or `1. ` matches bullet points in slides.
