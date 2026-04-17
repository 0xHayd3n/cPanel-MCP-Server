import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerDnssecTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "enable_dnssec",
    "Enable DNSSEC for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "enable_dnssec", { domain });
      return { content: [{ type: "text", text: `DNSSEC enabled for: ${domain}` }] };
    }
  );

  server.tool(
    "disable_dnssec",
    "Disable DNSSEC for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "disable_dnssec", { domain });
      return { content: [{ type: "text", text: `DNSSEC disabled for: ${domain}` }] };
    }
  );

  server.tool(
    "get_dnssec_ds_records",
    "Fetch DS records for a DNSSEC-enabled domain (needed for registrar configuration)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "fetch_ds_records", { domain });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "export_dnssec_key",
    "Export a DNSSEC DNSKEY record for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "export_zone_dnskey", { domain });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "set_dnssec_nsec3",
    "Enable NSEC3 for a DNSSEC domain (prevents zone enumeration)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "set_nsec3", { domain });
      return { content: [{ type: "text", text: `NSEC3 enabled for: ${domain}` }] };
    }
  );

  server.tool(
    "unset_dnssec_nsec3",
    "Disable NSEC3 for a DNSSEC domain (revert to NSEC)",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DNSSEC", "unset_nsec3", { domain });
      return { content: [{ type: "text", text: `NSEC3 disabled for: ${domain}` }] };
    }
  );
}
