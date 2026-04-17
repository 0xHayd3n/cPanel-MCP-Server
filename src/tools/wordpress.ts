import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData } from "../tool-helpers.js";

export function registerWordPressTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_wordpress_installations",
    "List all WordPress installations managed by cPanel (requires WP Toolkit or Instance Manager on server)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("WordPressInstanceManager", "get_instances");
        return formatData(result.data);
      })
  );
}
