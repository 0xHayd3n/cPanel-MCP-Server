import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerPhpTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_php_versions",
    "List all installed PHP versions available on the server",
    {},
    async () => {
      const result = await client.uapi("LangPHP", "php_get_installed_versions");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_php_version_for_domain",
    "Get the current PHP version assigned to a domain",
    { domain: z.string().describe("Domain name to check") },
    async ({ domain }) => {
      const result = await client.uapi("LangPHP", "php_get_domain_handler", {
        type: "home",
        vhost: domain,
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "set_php_version_for_domain",
    "Set the PHP version for a domain",
    {
      domain: z.string().describe("Domain name"),
      version: z.string().describe("PHP version (e.g., 'ea-php81', 'ea-php82', 'ea-php83')"),
    },
    async ({ domain, version }) => {
      const result = await client.uapi("LangPHP", "php_set_domain_handler", {
        type: "home",
        vhost: domain,
        php_version: version,
      });
      return { content: [{ type: "text", text: `PHP version for ${domain} set to ${version}` }] };
    }
  );

  server.tool(
    "get_php_ini_directives",
    "Get current PHP INI directives for the account",
    {},
    async () => {
      const result = await client.uapi("LangPHP", "php_ini_get_user_content");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "set_php_ini_directives",
    "Set PHP INI directives (e.g., memory_limit, upload_max_filesize)",
    {
      content: z.string().describe("PHP INI content (e.g., 'memory_limit = 256M\\nupload_max_filesize = 64M')"),
    },
    async ({ content }) => {
      const result = await client.uapi("LangPHP", "php_ini_set_user_content", {
        content,
      });
      return { content: [{ type: "text", text: "PHP INI directives updated" }] };
    }
  );
}
