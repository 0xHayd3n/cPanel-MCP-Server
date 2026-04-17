import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerFeatureTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_features",
    "List all features available to the cPanel account",
    {},
    async () => {
      const result = await client.uapi("Features", "list_features");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "check_feature",
    "Check if a specific feature is enabled for the account",
    { feature: z.string().describe("Feature name to check (e.g., 'mysql', 'postgres', 'cron', 'ssl')") },
    async ({ feature }) => {
      const result = await client.uapi("Features", "has_feature", { feature });
      return {
        content: [
          {
            type: "text",
            text: `Feature '${feature}': ${result.data ? "enabled" : "disabled"}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_account_info",
    "Get general server and account information",
    {},
    async () => {
      const result = await client.uapi("Variables", "get_user_information");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_server_info",
    "Get server information (hostname, OS, IP addresses)",
    {},
    async () => {
      const result = await client.uapi("ServerInformation", "get_information");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
