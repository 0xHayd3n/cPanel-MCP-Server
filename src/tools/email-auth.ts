import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerEmailAuthTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "enable_dkim",
    "Enable DKIM (DomainKeys Identified Mail) for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("EmailAuth", "enable_dkim", { domain });
      return { content: [{ type: "text", text: `DKIM enabled for: ${domain}` }] };
    }
  );

  server.tool(
    "disable_dkim",
    "Disable DKIM for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("EmailAuth", "disable_dkim", { domain });
      return { content: [{ type: "text", text: `DKIM disabled for: ${domain}` }] };
    }
  );

  server.tool(
    "ensure_dkim_keys",
    "Ensure DKIM keys exist for all domains (generates missing keys)",
    {},
    async () => {
      const result = await client.uapi("EmailAuth", "ensure_dkim_keys_exist");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "validate_dkim",
    "Validate current DKIM configuration for all domains",
    {},
    async () => {
      const result = await client.uapi("EmailAuth", "validate_current_dkims");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "validate_spf",
    "Validate current SPF records for all domains",
    {},
    async () => {
      const result = await client.uapi("EmailAuth", "validate_current_spfs");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "install_spf_records",
    "Install/update SPF records for all domains",
    {},
    async () => {
      const result = await client.uapi("EmailAuth", "install_spf_records");
      return { content: [{ type: "text", text: "SPF records installed/updated for all domains" }] };
    }
  );

  server.tool(
    "validate_ptr_records",
    "Validate current PTR (reverse DNS) records",
    {},
    async () => {
      const result = await client.uapi("EmailAuth", "validate_current_ptrs");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
