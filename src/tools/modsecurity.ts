import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerModSecurityTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_modsecurity_status",
    "Check if ModSecurity (WAF) is installed and get domain status",
    {},
    async () => {
      const installed = await client.uapi("ModSecurity", "has_modsecurity_installed");
      const domains = await client.uapi("ModSecurity", "list_domains");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ installed: installed.data, domains: domains.data }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "enable_modsecurity",
    "Enable ModSecurity (WAF) for all domains",
    {},
    async () => {
      const result = await client.uapi("ModSecurity", "enable_all_domains");
      return { content: [{ type: "text", text: "ModSecurity enabled for all domains" }] };
    }
  );

  server.tool(
    "disable_modsecurity",
    "Disable ModSecurity (WAF) for all domains",
    {},
    async () => {
      const result = await client.uapi("ModSecurity", "disable_all_domains");
      return { content: [{ type: "text", text: "ModSecurity disabled for all domains" }] };
    }
  );

  server.tool(
    "enable_modsecurity_domain",
    "Enable ModSecurity for specific domains",
    { domains: z.string().describe("Comma-separated list of domains to enable ModSecurity on") },
    async ({ domains }) => {
      const result = await client.uapi("ModSecurity", "enable_domains", { domains });
      return { content: [{ type: "text", text: `ModSecurity enabled for: ${domains}` }] };
    }
  );

  server.tool(
    "disable_modsecurity_domain",
    "Disable ModSecurity for specific domains",
    { domains: z.string().describe("Comma-separated list of domains to disable ModSecurity on") },
    async ({ domains }) => {
      const result = await client.uapi("ModSecurity", "disable_domains", { domains });
      return { content: [{ type: "text", text: `ModSecurity disabled for: ${domains}` }] };
    }
  );
}
