import { Context } from "cordis";
import { parseWechatArticle } from "../core/parser.js";

export const name = "via54-wechat";
export const inject = ["tools"];

export interface Config {}

export function apply(ctx: Context, config: Config) {
  (ctx as any).tools.register({
    name: "parse_wechat_article",
    description: "Parse WeChat official account articles (微信公众号文章) and return their markdown content, title, and metadata.",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The WeChat article URL (e.g. https://mp.weixin.qq.com/s/...)",
        },
      },
      required: ["url"],
    },
    async execute({ url }: { url: string }) {
      try {
        const article = await parseWechatArticle(url);
        return article;
      } catch (error: any) {
        throw new Error(`Failed to parse WeChat article: ${error.message}`);
      }
    },
  });
}
