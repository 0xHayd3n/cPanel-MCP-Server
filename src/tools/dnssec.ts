import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";

export function registerDnssecTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "enable_dnssec",
    "Enable DNSSEC for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "enable_dnssec", { domain: d });
        return formatSuccess(`DNSSEC enabled for: ${d}`, result.data);
      })
  );

  server.tool(
    "disable_dnssec",
    "Disable DNSSEC for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "disable_dnssec", { domain: d });
        return formatSuccess(`DNSSEC disabled for: ${d}`, result.data);
      })
  );

  server.tool(
    "get_dnssec_ds_records",
    "Fetch DS records for a DNSSEC-enabled domain (needed for registrar configuration)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "fetch_ds_records", { domain: d });
        return formatData(result.data);
      })
  );

  server.tool(
    "export_dnssec_key",
    "Export a DNSSEC DNSKEY record for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "export_zone_dnskey", { domain: d });
        return formatData(result.data);
      })
  );

  server.tool(
    "set_dnssec_nsec3",
    "Enable NSEC3 for a DNSSEC domain (prevents zone enumeration)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "set_nsec3", { domain: d });
        return formatSuccess(`NSEC3 enabled for: ${d}`, result.data);
      })
  );

  server.tool(
    "unset_dnssec_nsec3",
    "Disable NSEC3 for a DNSSEC domain (revert to NSEC)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DNSSEC", "unset_nsec3", { domain: d });
        return formatSuccess(`NSEC3 disabled for: ${d}`, result.data);
      })
  );
}
