import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerDiskTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_disk_usage",
    "Get account disk space usage summary",
    {},
    async () => {
      const result = await client.uapi("Quota", "get_local_quota_info");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_directory_usage",
    "Get disk usage breakdown by directory",
    { path: z.string().default("/").describe("Directory path to analyze") },
    async ({ path }) => {
      const result = await client.uapi("DiskUsage", "get_disk_usage", { dir: path });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
