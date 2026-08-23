---
name: via54medit-router-skill
description: Go-based multi-source medical EBM router - mapping natural language questions to PICO elements and dispatching to PubMed/OpenAlex.
version: 4.5.0
---

# via54medit · 循证医学多源文献路由器

> 汇聚 PubMed、OpenAlex 与 Semantic Scholar，对临床问题进行多源并发检索和富化。

## When to Use

Use when:
- Resolving medical natural language questions into PICO frames.
- Multi-source de-duplication and 4-tier citation ranking.
- Injecting real medical literature into LLM report generation contexts.

## Implementation Guide

1. Five-layer architecture entry:
- Entry: `cmd/medit/` & `cmd/medit-mcp/`
- Router: `internal/router/` (classify, plan, dispatch, merge)
- Sources: `internal/source/` (PubMed, OpenAlex, Semantic Scholar)

2. EBM classification categories:
- Treatment, Diagnosis, Prognosis, Etiology, Prevention, Economic.
- Extraction of Population, Intervention, Comparison, Outcome (PICO) properties.
