#!/usr/bin/env node
import { parseWechatArticle } from "../core/parser.js";

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(arg => !arg.startsWith("-"));
  const jsonMode = args.includes("--json") || args.includes("-j");

  if (!urlArg) {
    console.error("Usage: wechat-parser <wechat-article-url> [--json]");
    process.exit(1);
  }

  try {
    const article = await parseWechatArticle(urlArg);

    if (jsonMode) {
      console.log(JSON.stringify(article, null, 2));
    } else {
      console.log(`========================================`);
      console.log(`标题: ${article.title}`);
      console.log(`公众号: ${article.accountName}`);
      console.log(`作者: ${article.author}`);
      console.log(`发布时间: ${article.publishTime}`);
      console.log(`链接: ${article.url}`);
      console.log(`========================================\n`);
      console.log(article.contentMarkdown);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
