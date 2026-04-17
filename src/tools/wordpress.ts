import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerWordPressTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_wordpress_installations",
    "List all WordPress installations managed by cPanel",
    {},
    async () => {
      const result = await client.uapi("WordPressInstanceManager", "get_instances");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
