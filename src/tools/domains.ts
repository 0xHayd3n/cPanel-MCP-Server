import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerDomainTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_domains",
    "List all domains on the account (main, addon, sub, parked)",
    {},
    async () => {
      const result = await client.uapi("DomainInfo", "domains_data", { format: "hash" });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_domain_info",
    "Get detailed information about a specific domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("DomainInfo", "single_domain_data", { domain });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  // --- Subdomains ---

  server.tool(
    "list_subdomains",
    "List all subdomains",
    {},
    async () => {
      const result = await client.uapi("SubDomain", "list_subdomains");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_subdomain",
    "Create a new subdomain",
    {
      subdomain: z.string().describe("Subdomain name (e.g., 'blog')"),
      domain: z.string().describe("Parent domain (e.g., 'example.com')"),
      document_root: z.string().optional().describe("Document root path (auto-generated if omitted)"),
    },
    async ({ subdomain, domain, document_root }) => {
      const params: Record<string, string> = { domain: subdomain, rootdomain: domain };
      if (document_root) params.dir = document_root;
      const result = await client.uapi("SubDomain", "addsubdomain", params);
      return { content: [{ type: "text", text: `Subdomain created: ${subdomain}.${domain}` }] };
    }
  );

  server.tool(
    "delete_subdomain",
    "Delete a subdomain",
    { subdomain: z.string().describe("Full subdomain (e.g., 'blog.example.com')") },
    async ({ subdomain }) => {
      const result = await client.uapi("SubDomain", "delsubdomain", { domain: subdomain });
      return { content: [{ type: "text", text: `Subdomain deleted: ${subdomain}` }] };
    }
  );

  // --- Addon Domains ---

  server.tool(
    "list_addon_domains",
    "List all addon domains",
    {},
    async () => {
      const result = await client.uapi("AddonDomain", "list_addon_domains");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_addon_domain",
    "Create a new addon domain",
    {
      domain: z.string().describe("New domain name to add"),
      subdomain: z.string().describe("Associated subdomain name"),
      document_root: z.string().describe("Document root directory path"),
    },
    async ({ domain, subdomain, document_root }) => {
      const result = await client.uapi("AddonDomain", "addaddondomain", {
        newdomain: domain,
        subdomain,
        dir: document_root,
      });
      return { content: [{ type: "text", text: `Addon domain created: ${domain}` }] };
    }
  );

  server.tool(
    "delete_addon_domain",
    "Delete an addon domain",
    {
      domain: z.string().describe("Addon domain to remove"),
      subdomain: z.string().describe("Associated subdomain"),
    },
    async ({ domain, subdomain }) => {
      const result = await client.uapi("AddonDomain", "deladdondomain", {
        domain,
        subdomain,
      });
      return { content: [{ type: "text", text: `Addon domain deleted: ${domain}` }] };
    }
  );

  // --- Parked Domains (Aliases) ---

  server.tool(
    "list_parked_domains",
    "List all parked/aliased domains",
    {},
    async () => {
      const result = await client.uapi("Park", "list_parked_domains");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_parked_domain",
    "Park/alias a domain to the main domain",
    { domain: z.string().describe("Domain to park") },
    async ({ domain }) => {
      const result = await client.uapi("Park", "park", { domain });
      return { content: [{ type: "text", text: `Domain parked: ${domain}` }] };
    }
  );

  server.tool(
    "delete_parked_domain",
    "Remove a parked/aliased domain",
    { domain: z.string().describe("Parked domain to remove") },
    async ({ domain }) => {
      const result = await client.uapi("Park", "unpark", { domain });
      return { content: [{ type: "text", text: `Parked domain removed: ${domain}` }] };
    }
  );

  // --- Redirects ---

  server.tool(
    "list_redirects",
    "List all URL redirects",
    {},
    async () => {
      const result = await client.uapi("Mime", "list_redirects");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_redirect",
    "Create a URL redirect",
    {
      domain: z.string().describe("Source domain"),
      path: z.string().default("/").describe("Source path (e.g., /old-page)"),
      redirect_url: z.string().describe("Destination URL"),
      type: z.enum(["permanent", "temp"]).default("permanent").describe("Redirect type (permanent=301, temp=302)"),
      redirect_wildcard: z.boolean().default(false).describe("Match all files in the directory"),
    },
    async ({ domain, path, redirect_url, type, redirect_wildcard }) => {
      const result = await client.uapi("Mime", "add_redirect", {
        domain,
        src: path,
        redirect: redirect_url,
        type,
        redirect_wildcard: redirect_wildcard ? "1" : "0",
      });
      return { content: [{ type: "text", text: `Redirect created: ${domain}${path} → ${redirect_url}` }] };
    }
  );

  server.tool(
    "delete_redirect",
    "Delete a URL redirect",
    {
      domain: z.string().describe("Source domain"),
      path: z.string().describe("Source path of the redirect to remove"),
    },
    async ({ domain, path }) => {
      const result = await client.uapi("Mime", "delete_redirect", {
        domain,
        src: path,
      });
      return { content: [{ type: "text", text: `Redirect deleted: ${domain}${path}` }] };
    }
  );
}
