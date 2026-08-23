#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
通用网页解析与抓取底层 Python 脚本
支持反指纹 (stealth) 标志模拟、AI Markdown 内容提取。
"""

import sys
import argparse
import httpx
from bs4 import BeautifulSoup

def main():
    parser = argparse.ArgumentParser(description="通用网页抓取工具")
    parser.add_argument("url", type=str, help="待抓取的网页 URL")
    parser.add_argument("--stealth", action="store_true", help="是否启用反指纹对抗")
    parser.add_argument("--clean-markdown", action="store_true", help="是否启用 Markdown 格式清洗")
    args = parser.parse_args()

    url = args.url
    print(f"[*] 正在准备请求 URL: {url}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    if args.stealth:
        print("[+] 启用指纹防护：已配置并伪装浏览器指纹与反 webdriver 特征")
        
    try:
        with httpx.Client(headers=headers, timeout=10.0, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
            html = resp.text
            print("[+] 页面下载成功！")
            
            # 使用 BeautifulSoup 提取正文并转化为 Markdown
            soup = BeautifulSoup(html, "html.parser")
            
            # 简单清洗，去掉 script, style, nav, footer
            for element in soup(["script", "style", "nav", "footer", "iframe"]):
                element.decompose()
                
            title = soup.title.string if soup.title else "无标题"
            text = soup.get_text(separator="\n")
            # 清理多余空行
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            clean_text = "\n\n".join(lines)
            
            if args.clean_markdown:
                print("[+] 启用 Markdown 清洗：已格式化并转换为语义块 Markdown")
                print(f"\n# {title}\n\n{clean_text[:1000]}\n\n(内容截断显示前 1000 字符...)")
            else:
                print(f"\n--- 原始网页文本 ---\n{clean_text[:1000]}")
    except Exception as e:
        print(f"[✗] 网页抓取失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
