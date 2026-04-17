import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerFeatureTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_features",
    "List all features available to the cPanel account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Features", "list_features");
        return formatData(result.data);
      })
  );

  server.tool(
    "check_feature",
    "Check if a specific feature is enabled for the account",
    { feature: z.string().describe("Feature name to check (e.g., 'mysql', 'postgres', 'cron', 'ssl')") },
    async ({ feature }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Features", "has_feature", { feature });
        return formatSuccess(
          `Feature '${feature}': ${result.data ? "enabled" : "disabled"}`,
          result.data
        );
      })
  );

  server.tool(
    "get_account_info",
    "Get general server and account information",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Variables", "get_user_information");
        return formatData(result.data);
      })
  );

  server.tool(
    "get_server_info",
    "Get server information (hostname, OS, IP addresses)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ServerInformation", "get_information");
        return formatData(result.data);
      })
  );
}
