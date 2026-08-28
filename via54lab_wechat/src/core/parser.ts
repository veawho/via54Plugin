import axios from "axios";
import * as cheerio from "cheerio";

export interface WechatArticle {
  title: string;
  author: string;
  publishTime: string;
  accountName: string;
  contentMarkdown: string;
  url: string;
  images: string[];
}

const WECHAT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090819) XWEB/9129";

export async function parseWechatArticle(url: string): Promise<WechatArticle> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": WECHAT_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $("#activity-name").text().trim();
    const author = $("#js_name").text().trim() || $(".rich_media_meta_text").first().text().trim();
    const accountName = $("#js_profile_qrcode .profile_nickname").text().trim() || $(".profile_nickname").text().trim() || $("#js_author_name").text().trim();

    let publishTime = "";
    const scripts = $("script").map((_, el) => $(el).html()).get();
    for (const script of scripts) {
      if (script && script.includes("var ct = ")) {
        const match = script.match(/var ct\s*=\s*"(\d+)"/);
        if (match && match[1]) {
          const timestamp = parseInt(match[1]) * 1000;
          publishTime = new Date(timestamp).toLocaleString("zh-CN");
          break;
        }
      }
    }

    const contentArea = $("#js_content");
    if (!title || !contentArea.length || contentArea.text().trim() === "") {
      console.warn("Failed to parse via Cheerio. Retrying with Jina Reader Cloud Fallback...");
      return await parseWithJinaFallback(url);
    }

    const images: string[] = [];
    const contentMarkdown = elementToMarkdown($, contentArea[0], images);

    return {
      title,
      author,
      publishTime: publishTime || "未知时间",
      accountName: accountName || "未知公众号",
      contentMarkdown,
      url,
      images
    };

  } catch (error: any) {
    console.error("Local fetch failed. Trying Jina Reader fallback...", error.message);
    return await parseWithJinaFallback(url);
  }
}

async function parseWithJinaFallback(url: string): Promise<WechatArticle> {
  const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
  try {
    const response = await axios.get(jinaUrl, {
      headers: {
        "X-Return-Format": "markdown"
      },
      timeout: 15000
    });

    const markdown = response.data;
    let title = "未知标题";
    let author = "";
    let publishTime = "";
    let accountName = "";

    const titleMatch = markdown.match(/^Title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    const authorMatch = markdown.match(/^Author:\s*(.+)$/m);
    if (authorMatch) author = authorMatch[1].trim();

    const bodyStartIdx = markdown.indexOf("\n\nMarkdown Content:\n") !== -1 
      ? markdown.indexOf("\n\nMarkdown Content:\n") + 20 
      : 0;
    
    const contentMarkdown = bodyStartIdx > 0 ? markdown.substring(bodyStartIdx).trim() : markdown;

    const images: string[] = [];
    const imgRegex = /!\[.*?\]\((https?:\/\/.*?)\)/g;
    let match;
    while ((match = imgRegex.exec(contentMarkdown)) !== null) {
      images.push(match[1]);
    }

    return {
      title,
      author: author || "未知作者",
      publishTime: publishTime || "未知时间",
      accountName: accountName || "微信公众号",
      contentMarkdown,
      url,
      images: Array.from(new Set(images))
    };
  } catch (err: any) {
    throw new Error(`Failed to parse WeChat article via all methods (Local & Cloud). Error: ${err.message}`);
  }
}

function elementToMarkdown($: cheerio.CheerioAPI, element: any, images: string[]): string {
  let markdown = "";
  
  if (element.type === "text") {
    return element.data || "";
  }

  if (element.type !== "tag") {
    return "";
  }

  const tagName = element.name.toLowerCase();

  const getChildrenMarkdown = () => {
    let result = "";
    if (element.children) {
      for (const child of element.children) {
        result += elementToMarkdown($, child, images);
      }
    }
    return result;
  };

  switch (tagName) {
    case "h1":
      markdown += `\n\n# ${getChildrenMarkdown()}\n\n`;
      break;
    case "h2":
      markdown += `\n\n## ${getChildrenMarkdown()}\n\n`;
      break;
    case "h3":
      markdown += `\n\n### ${getChildrenMarkdown()}\n\n`;
      break;
    case "h4":
      markdown += `\n\n#### ${getChildrenMarkdown()}\n\n`;
      break;
    case "p":
    case "section":
      const pText = getChildrenMarkdown().trim();
      if (pText) {
        markdown += `\n\n${pText}\n\n`;
      }
      break;
    case "br":
      markdown += "\n";
      break;
    case "strong":
    case "b":
      markdown += `**${getChildrenMarkdown()}**`;
      break;
    case "em":
    case "i":
      markdown += `*${getChildrenMarkdown()}*`;
      break;
    case "code":
      markdown += ` \`${getChildrenMarkdown()}\` `;
      break;
    case "pre":
      markdown += `\n\`\`\`\n${getChildrenMarkdown().trim()}\n\`\`\`\n`;
      break;
    case "ul":
      markdown += `\n${getChildrenMarkdown()}\n`;
      break;
    case "ol":
      markdown += `\n${getChildrenMarkdown()}\n`;
      break;
    case "li":
      const parentName = element.parent?.name?.toLowerCase();
      if (parentName === "ol") {
        markdown += `1. ${getChildrenMarkdown()}\n`;
      } else {
        markdown += `- ${getChildrenMarkdown()}\n`;
      }
      break;
    case "img":
      const src = $(element).attr("data-src") || $(element).attr("src") || "";
      if (src && src.startsWith("http")) {
        images.push(src);
        markdown += `\n![image](${src})\n`;
      }
      break;
    case "a":
      const href = $(element).attr("href") || "";
      const text = getChildrenMarkdown().trim();
      if (href && text) {
        markdown += `[${text}](${href})`;
      } else if (text) {
        markdown += text;
      }
      break;
    default:
      markdown += getChildrenMarkdown();
      break;
  }

  return markdown.replace(/\n{3,}/g, "\n\n");
}
