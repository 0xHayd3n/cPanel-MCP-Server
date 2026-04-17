import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerMetricsTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_bandwidth_usage",
    "Get bandwidth usage statistics for the account",
    {},
    async () => {
      const result = await client.uapi("Bandwidth", "get_enabled_protocols");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_resource_usage",
    "Get current resource usage (CPU, memory, I/O, entry processes)",
    {},
    async () => {
      const result = await client.uapi("ResourceUsage", "get_usages");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_error_log",
    "Get the most recent entries from the error log",
    {
      lines: z.string().default("100").describe("Number of lines to retrieve"),
    },
    async ({ lines }) => {
      const result = await client.uapi("Logd", "get_recent_errors", {
        lines,
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_visitors_stats",
    "Get visitor/access statistics for a domain",
    {
      domain: z.string().describe("Domain to get stats for"),
    },
    async ({ domain }) => {
      const result = await client.uapi("Stats", "list_stats_by_domain", { domain });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_account_stats",
    "Get general account statistics (email count, db count, domains, etc.)",
    {},
    async () => {
      const result = await client.uapi("StatsBar", "get_stats", {
        display: "hostname|dedicatedip|sharedip|operatingsystem|emailaccounts|mysqldatabases|subdomains|addondomains|parkeddomains|bandwidthusage|diskusage",
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
