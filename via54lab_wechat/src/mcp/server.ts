import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { parseWechatArticle } from "../core/parser.js";

const server = new Server(
  {
    name: "via54-wechat-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "parse_wechat_article",
        description: "Parse a WeChat official account article (微信公众号文章) and return its markdown content, title, author, and metadata.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The WeChat article URL (e.g. https://mp.weixin.qq.com/s/...)",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "parse_wechat_article") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const url = request.params.arguments?.url as string;
  if (!url) {
    throw new Error("Missing 'url' argument");
  }

  try {
    const article = await parseWechatArticle(url);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(article, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error parsing WeChat article: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WeChat Parser MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running MCP server:", error);
  process.exit(1);
});
