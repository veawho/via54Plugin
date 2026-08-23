---
name: anti-fingerprint-skill
description: Anti-fingerprint Playwright stealth tool integration - stealth.min.js injection and bezier curve mouse movement simulator.
version: 2.0.0
---

# SK-003 · Anti-Fingerprint (反浏览器指纹)

> 让 Playwright 控制的浏览器不被识别为自动化工具，绕过主流网站爬虫风控。

## When to Use

Use when encountering:
- Cloudflare browser fingerprint verification.
- Automation detection blocks (webdriver = true).
- Needs human-like mouse movement and browsing behaviors.

## Implementation Guide

1. Disable automation features in Chromium args:
```python
chrome_args = [
    "--disable-blink-features=AutomationControlled",
    "--remote-debugging-port=9222"
]
```

2. Inject standard `stealth.min.js`:
```python
await context.add_init_script(content=open("stealth.min.js").read())
```

3. Bezier mouse movement simulator:
```python
# 二次贝塞尔鼠标移动，使自动化操作轨迹看起来像真人
async def bezier_mouse_move(page, x0, y0, x1, y1, steps=20):
    cx = (x0 + x1) / 2 + random.uniform(-50, 50)
    cy = (y0 + y1) / 2 + random.uniform(-50, 50)
    for t in [i / steps for i in range(steps + 1)]:
        x = (1-t)**2 * x0 + 2*(1-t)*t * cx + t**2 * x1
        y = (1-t)**2 * y0 + 2*(1-t)*t * cy + t**2 * y1
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.01, 0.05))
```
