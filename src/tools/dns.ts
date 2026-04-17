import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerDnsTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_dns_zones",
    "List all DNS zones on the account",
    {},
    async () => {
      const result = await client.uapi("DNS", "list_dns_zones");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_dns_records",
    "Get all DNS records for a zone/domain",
    { domain: z.string().describe("Domain name to get records for") },
    async ({ domain }) => {
      const result = await client.uapi("DNS", "parse_zone", { zone: domain });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "add_dns_record",
    "Add a DNS zone record (A, AAAA, CNAME, MX, TXT, SRV, CAA)",
    {
      domain: z.string().describe("Domain/zone name"),
      name: z.string().describe("Record name (e.g. subdomain.domain.com.)"),
      type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA"]).describe("Record type"),
      address: z.string().describe("Record value/address"),
      ttl: z.string().default("14400").describe("TTL in seconds"),
      priority: z.string().optional().describe("Priority (required for MX and SRV)"),
      class: z.string().default("IN").describe("Record class"),
    },
    async ({ domain, name, type, address, ttl, priority, class: recordClass }) => {
      const params: Record<string, string> = {
        zone: domain,
        name,
        type,
        address,
        ttl,
        class: recordClass,
      };
      if (priority) params.preference = priority;

      const result = await client.uapi("DNS", "mass_edit_zone", {
        zone: domain,
        "add": JSON.stringify(params),
      });
      return { content: [{ type: "text", text: `DNS ${type} record added: ${name} → ${address}` }] };
    }
  );

  server.tool(
    "edit_dns_record",
    "Edit an existing DNS zone record",
    {
      domain: z.string().describe("Domain/zone name"),
      line: z.string().describe("Line number of the record to edit (from get_dns_records)"),
      name: z.string().describe("Record name"),
      type: z.string().describe("Record type"),
      address: z.string().describe("New record value"),
      ttl: z.string().default("14400").describe("TTL in seconds"),
    },
    async ({ domain, line, name, type, address, ttl }) => {
      const result = await client.uapi("DNS", "mass_edit_zone", {
        zone: domain,
        "edit": JSON.stringify({ line, name, type, address, ttl }),
      });
      return { content: [{ type: "text", text: `DNS record updated on line ${line}` }] };
    }
  );

  server.tool(
    "delete_dns_record",
    "Delete a DNS zone record by line number",
    {
      domain: z.string().describe("Domain/zone name"),
      line: z.string().describe("Line number of the record to delete (from get_dns_records)"),
    },
    async ({ domain, line }) => {
      const result = await client.uapi("DNS", "mass_edit_zone", {
        zone: domain,
        "remove": line,
      });
      return { content: [{ type: "text", text: `DNS record on line ${line} deleted from ${domain}` }] };
    }
  );
}
