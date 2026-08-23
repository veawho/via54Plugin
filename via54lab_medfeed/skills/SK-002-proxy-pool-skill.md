---
name: proxy-pool-skill
description: Dynamic proxy pool management for robust crawling - auto rotating IP addresses and health verification to evade site ip blocklists.
version: 2.0.0
---

# SK-002 · Proxy Pool (动态代理池调度)

> 管理爬虫的“血液”代理池，规避高频爬取时目标医保局与集采平台对 IP 的拉黑。

## When to Use

Use when:
- High frequency polling on medical government agencies.
- Needs rotating HTTP/Socks5 proxy connections.
- Handling "403 Forbidden" or "503 Service Unavailable" errors.

## Implementation Guide

1. Define proxy config yaml:
```yaml
proxy:
  enabled: true
  providers: [kuaidaili, wandouhttp, static]
  validate_url: "https://ip.sb"
```

2. Load and refresh proxies:
```python
# Rotate proxies on request failures automatically
async with httpx.AsyncClient(proxies=f"http://{proxy.ip}:{proxy.port}") as client:
    try:
        response = await client.get(url)
    except httpx.HTTPError:
        proxy_pool.report_failed_ip(proxy)
```
