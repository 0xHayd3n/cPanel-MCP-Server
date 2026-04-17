import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";

export function registerEmailAuthTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "enable_dkim",
    "Enable DKIM (DomainKeys Identified Mail) for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("EmailAuth", "enable_dkim", { domain: d });
        return formatSuccess(`DKIM enabled for: ${d}`, result.data);
      })
  );

  server.tool(
    "disable_dkim",
    "Disable DKIM for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("EmailAuth", "disable_dkim", { domain: d });
        return formatSuccess(`DKIM disabled for: ${d}`, result.data);
      })
  );

  server.tool(
    "ensure_dkim_keys",
    "Ensure DKIM keys exist for all domains (generates missing keys)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("EmailAuth", "ensure_dkim_keys_exist");
        return formatData(result.data);
      })
  );

  server.tool(
    "validate_dkim",
    "Validate current DKIM configuration for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("EmailAuth", "validate_current_dkims");
        return formatData(result.data);
      })
  );

  server.tool(
    "validate_spf",
    "Validate current SPF records for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("EmailAuth", "validate_current_spfs");
        return formatData(result.data);
      })
  );

  server.tool(
    "install_spf_records",
    "Install/update SPF records for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("EmailAuth", "install_spf_records");
        return formatSuccess("SPF records installed/updated for all domains", result.data);
      })
  );

  server.tool(
    "validate_ptr_records",
    "Validate current PTR (reverse DNS) records",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("EmailAuth", "validate_current_ptrs");
        return formatData(result.data);
      })
  );
}
