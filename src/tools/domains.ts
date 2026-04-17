import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";

export function registerDomainTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_domains",
    "List all domains on the account (main, addon, sub, parked)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("DomainInfo", "domains_data", { format: "hash" });
        return formatData(result.data);
      })
  );

  server.tool(
    "get_domain_info",
    "Get detailed information about a specific domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("DomainInfo", "single_domain_data", { domain: d });
        return formatData(result.data);
      })
  );

  // --- Subdomains ---

  server.tool(
    "list_subdomains",
    "List all subdomains",
    {},
    async () =>
      handleToolCall(async () => {
        const data = await client.api2("SubDomain", "listsubdomains");
        return formatData(data);
      })
  );

  server.tool(
    "create_subdomain",
    "Create a new subdomain",
    {
      subdomain: z.string().describe("Subdomain name (e.g., 'blog')"),
      domain: z.string().describe("Parent domain (e.g., 'example.com')"),
      document_root: z.string().optional().describe("Document root path (auto-generated if omitted)"),
    },
    async ({ subdomain, domain, document_root }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const params: Record<string, string> = { domain: subdomain, rootdomain: d };
        if (document_root) params.dir = document_root;
        const data = await client.api2("SubDomain", "addsubdomain", params);
        return formatSuccess(`Subdomain created: ${subdomain}.${d}`, data);
      })
  );

  server.tool(
    "delete_subdomain",
    "Delete a subdomain",
    { subdomain: z.string().describe("Full subdomain (e.g., 'blog.example.com')") },
    async ({ subdomain }) =>
      handleToolCall(async () => {
        const data = await client.api2("SubDomain", "delsubdomain", { domain: subdomain });
        return formatSuccess(`Subdomain deleted: ${subdomain}`, data);
      })
  );

  // --- Addon Domains (API2 — no UAPI equivalent) ---

  server.tool(
    "list_addon_domains",
    "List all addon domains",
    {},
    async () =>
      handleToolCall(async () => {
        const data = await client.api2("AddonDomain", "listaddondomains");
        return formatData(data);
      })
  );

  server.tool(
    "create_addon_domain",
    "Create a new addon domain",
    {
      domain: z.string().describe("New domain name to add"),
      subdomain: z.string().describe("Associated subdomain name"),
      document_root: z.string().describe("Document root directory path"),
    },
    async ({ domain, subdomain, document_root }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const data = await client.api2("AddonDomain", "addaddondomain", {
          newdomain: d,
          subdomain,
          dir: document_root,
        });
        return formatSuccess(`Addon domain created: ${d}`, data);
      })
  );

  server.tool(
    "delete_addon_domain",
    "Delete an addon domain",
    {
      domain: z.string().describe("Addon domain to remove"),
      subdomain: z.string().describe("Associated subdomain"),
    },
    async ({ domain, subdomain }) =>
      handleToolCall(async () => {
        const data = await client.api2("AddonDomain", "deladdondomain", {
          domain,
          subdomain,
        });
        return formatSuccess(`Addon domain deleted: ${domain}`, data);
      })
  );

  // --- Parked Domains / Aliases (API2 — no UAPI equivalent) ---

  server.tool(
    "list_parked_domains",
    "List all parked/aliased domains",
    {},
    async () =>
      handleToolCall(async () => {
        const data = await client.api2("Park", "listparkeddomains");
        return formatData(data);
      })
  );

  server.tool(
    "create_parked_domain",
    "Park/alias a domain to the main domain",
    { domain: z.string().describe("Domain to park") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const data = await client.api2("Park", "park", { domain: d });
        return formatSuccess(`Domain parked: ${d}`, data);
      })
  );

  server.tool(
    "delete_parked_domain",
    "Remove a parked/aliased domain",
    { domain: z.string().describe("Parked domain to remove") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const data = await client.api2("Park", "unpark", { domain });
        return formatSuccess(`Parked domain removed: ${domain}`, data);
      })
  );

  // --- Redirects (UAPI Mime module) ---

  server.tool(
    "list_redirects",
    "List all URL redirects",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Mime", "list_redirects");
        return formatData(result.data);
      })
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
    async ({ domain, path, redirect_url, type, redirect_wildcard }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mime", "add_redirect", {
          domain,
          src: path,
          redirect: redirect_url,
          type,
          redirect_wildcard: redirect_wildcard ? "1" : "0",
        });
        return formatSuccess(`Redirect created: ${domain}${path} → ${redirect_url}`, result.data);
      })
  );

  server.tool(
    "delete_redirect",
    "Delete a URL redirect",
    {
      domain: z.string().describe("Source domain"),
      path: z.string().describe("Source path of the redirect to remove"),
    },
    async ({ domain, path }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mime", "delete_redirect", {
          domain,
          src: path,
        });
        return formatSuccess(`Redirect deleted: ${domain}${path}`, result.data);
      })
  );
}
