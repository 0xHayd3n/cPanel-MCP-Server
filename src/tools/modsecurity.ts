import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerModSecurityTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_modsecurity_status",
    "Check if ModSecurity (WAF) is installed and get domain status",
    {},
    async () =>
      handleToolCall(async () => {
        const installed = await client.uapi("ModSecurity", "has_modsecurity_installed");
        const domains = await client.uapi("ModSecurity", "list_domains");
        return formatData({ installed: installed.data, domains: domains.data });
      })
  );

  server.tool(
    "enable_modsecurity",
    "Enable ModSecurity (WAF) for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ModSecurity", "enable_all_domains");
        return formatSuccess("ModSecurity enabled for all domains", result.data);
      })
  );

  server.tool(
    "disable_modsecurity",
    "Disable ModSecurity (WAF) for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ModSecurity", "disable_all_domains");
        return formatSuccess("ModSecurity disabled for all domains", result.data);
      })
  );

  server.tool(
    "enable_modsecurity_domain",
    "Enable ModSecurity for specific domains",
    { domains: z.string().describe("Comma-separated list of domains to enable ModSecurity on") },
    async ({ domains }) =>
      handleToolCall(async () => {
        const result = await client.uapi("ModSecurity", "enable_domains", { domains });
        return formatSuccess(`ModSecurity enabled for: ${domains}`, result.data);
      })
  );

  server.tool(
    "disable_modsecurity_domain",
    "Disable ModSecurity for specific domains",
    { domains: z.string().describe("Comma-separated list of domains to disable ModSecurity on") },
    async ({ domains }) =>
      handleToolCall(async () => {
        const result = await client.uapi("ModSecurity", "disable_domains", { domains });
        return formatSuccess(`ModSecurity disabled for: ${domains}`, result.data);
      })
  );
}
