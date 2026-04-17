import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";

export function registerSslTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_ssl_certificates",
    "List all installed SSL certificates",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSL", "list_certs");
        return formatData(result.data);
      })
  );

  server.tool(
    "get_ssl_status",
    "Get SSL status for all domains on the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSL", "installed_hosts");
        return formatData(result.data);
      })
  );

  server.tool(
    "install_ssl_certificate",
    "Install an SSL certificate for a domain",
    {
      domain: z.string().describe("Domain name for the certificate"),
      cert: z.string().describe("Certificate content (PEM format)"),
      key: z.string().describe("Private key content (PEM format)"),
      cabundle: z.string().optional().describe("CA bundle content (PEM format)"),
    },
    async ({ domain, cert, key, cabundle }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const params: Record<string, string> = { domain: d, cert, key };
        if (cabundle) params.cabundle = cabundle;
        const result = await client.uapiPost("SSL", "install_ssl", params);
        return formatSuccess(`SSL certificate installed for: ${d}`, result.data);
      })
  );

  server.tool(
    "delete_ssl_certificate",
    "Delete/uninstall an SSL certificate from a domain",
    { domain: z.string().describe("Domain to remove SSL from") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("SSL", "delete_ssl", { domain: d });
        return formatSuccess(`SSL certificate removed from: ${d}`, result.data);
      })
  );

  server.tool(
    "generate_ssl_csr",
    "Generate a Certificate Signing Request (CSR)",
    {
      domain: z.string().describe("Domain name for the CSR"),
      country: z.string().describe("Two-letter country code (e.g., US)"),
      state: z.string().describe("State/province"),
      city: z.string().describe("City/locality"),
      company: z.string().describe("Organization name"),
      division: z.string().default("IT").describe("Organizational unit"),
      email: z.string().describe("Contact email address"),
    },
    async ({ domain, country, state, city, company, division, email }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("SSL", "generate_csr", {
          domains: d,
          countryName: country,
          stateOrProvinceName: state,
          localityName: city,
          organizationName: company,
          organizationalUnitName: division,
          emailAddress: email,
        });
        return formatData(result.data);
      })
  );

  server.tool(
    "get_autossl_status",
    "Check AutoSSL status and pending requests",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSL", "get_autossl_problems");
        return formatData(result.data);
      })
  );

  server.tool(
    "trigger_autossl",
    "Trigger an AutoSSL check/renewal for the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSL", "start_autossl_check");
        return formatSuccess(
          "AutoSSL check triggered. Certificates will be issued/renewed as needed.",
          result.data
        );
      })
  );

  server.tool(
    "list_ssl_keys",
    "List all SSL private keys on the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSL", "list_keys");
        return formatData(result.data);
      })
  );
}
