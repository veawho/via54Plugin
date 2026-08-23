---
name: ai-crawler-skill
description: LLM-friendly web scraper integration - crawl4ai implementation to output clean Markdown files for RAG or LLM context ingestion.
version: 2.0.0
---

# SK-005 · AI Scraper (全文结构化提取)

> 使用 AI 爬虫提取无广告的网页纯净 Markdown 正文，用于 RAG 喂入和大模型上下文解析。

## When to Use

Use when:
- Gathering clean full-text content of public pages for RAG.
- Translating chaotic HTML to readable LLM-friendly Markdown.
- Automatic extraction based on specific JSON schemas.

## Implementation Guide

1. Initiate crawl4ai config:
```python
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

async def crawl_to_markdown(url):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=url,
            config=CrawlerRunConfig(output_format="markdown")
        )
        return result.markdown
```

2. Extraction using JSON Schema:
```python
schema = {
    "title": "Title (str)",
    "published_date": "Date (str)",
    "summary": "100-char summary (str)"
}
# Run with LLMExtractionStrategy to extract metadata automatically
```
