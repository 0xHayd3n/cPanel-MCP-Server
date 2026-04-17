import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";

export function registerMetricsTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_bandwidth_usage",
    "Get bandwidth usage statistics for the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Bandwidth", "get_enabled_protocols");
        return formatData(result.data);
      })
  );

  server.tool(
    "get_resource_usage",
    "Get current resource usage (CPU, memory, I/O, entry processes)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ResourceUsage", "get_usages");
        return formatData(result.data);
      })
  );

  server.tool(
    "get_error_log",
    "Get the most recent entries from the site error log",
    {
      domain: z.string().describe("Domain to get errors for"),
    },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("Stats", "get_site_errors", { domain: d });
        return formatData(result.data);
      })
  );

  server.tool(
    "get_visitors_stats",
    "Get visitor/access statistics for a domain",
    {
      domain: z.string().describe("Domain to get stats for"),
    },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("Stats", "list_stats_by_domain", { domain: d });
        return formatData(result.data);
      })
  );

  server.tool(
    "get_account_stats",
    "Get general account statistics (email count, db count, domains, etc.)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("StatsBar", "get_stats", {
          display: "hostname|dedicatedip|sharedip|operatingsystem|emailaccounts|mysqldatabases|subdomains|addondomains|parkeddomains|bandwidthusage|diskusage",
        });
        return formatData(result.data);
      })
  );
}
