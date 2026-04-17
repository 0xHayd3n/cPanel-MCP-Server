import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerSecurityTools(server: McpServer, client: CpanelClient) {
  // --- IP Blocker ---

  server.tool(
    "list_blocked_ips",
    "List all blocked IP addresses",
    {},
    async () => {
      const result = await client.uapi("BlockIP", "get_ips");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "block_ip",
    "Block an IP address or range",
    { ip: z.string().describe("IP address, range (e.g., 10.0.0.0/24), or CIDR notation") },
    async ({ ip }) => {
      const result = await client.uapi("BlockIP", "add_ip", { ip });
      return { content: [{ type: "text", text: `IP blocked: ${ip}` }] };
    }
  );

  server.tool(
    "unblock_ip",
    "Unblock a previously blocked IP address",
    { ip: z.string().describe("IP address or range to unblock") },
    async ({ ip }) => {
      const result = await client.uapi("BlockIP", "remove_ip", { ip });
      return { content: [{ type: "text", text: `IP unblocked: ${ip}` }] };
    }
  );

  // --- SSH Keys ---

  server.tool(
    "list_ssh_keys",
    "List all SSH keys on the account",
    {},
    async () => {
      const result = await client.uapi("SSH", "list_keys");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "import_ssh_key",
    "Import an SSH public or private key",
    {
      name: z.string().describe("Key name/identifier"),
      key: z.string().describe("Key content"),
      type: z.enum(["rsa", "dsa"]).default("rsa").describe("Key type"),
    },
    async ({ name, key, type }) => {
      const result = await client.uapi("SSH", "import_key", {
        name,
        key,
        type,
      });
      return { content: [{ type: "text", text: `SSH key imported: ${name}` }] };
    }
  );

  server.tool(
    "delete_ssh_key",
    "Delete an SSH key",
    {
      name: z.string().describe("Key name to delete"),
      type: z.enum(["public", "private"]).describe("Whether to delete public or private key"),
    },
    async ({ name, type }) => {
      const isPublic = type === "public" ? "1" : "0";
      const result = await client.uapi("SSH", "delete_key", {
        name,
        pub: isPublic,
      });
      return { content: [{ type: "text", text: `SSH ${type} key deleted: ${name}` }] };
    }
  );

  server.tool(
    "authorize_ssh_key",
    "Authorize an SSH key for login",
    { name: z.string().describe("Key name to authorize") },
    async ({ name }) => {
      const result = await client.uapi("SSH", "authorize_key", { name });
      return { content: [{ type: "text", text: `SSH key authorized: ${name}` }] };
    }
  );

  server.tool(
    "deauthorize_ssh_key",
    "Deauthorize an SSH key (revoke login access)",
    { name: z.string().describe("Key name to deauthorize") },
    async ({ name }) => {
      const result = await client.uapi("SSH", "deauthorize_key", { name });
      return { content: [{ type: "text", text: `SSH key deauthorized: ${name}` }] };
    }
  );

  // --- Hotlink Protection ---

  server.tool(
    "get_hotlink_protection",
    "Get current hotlink protection settings",
    {},
    async () => {
      const result = await client.uapi("HotlinkProtection", "get");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "enable_hotlink_protection",
    "Enable hotlink protection",
    {
      urls: z.string().describe("Comma-separated list of allowed referrer URLs"),
      extensions: z.string().default("jpg,jpeg,gif,png,bmp,svg").describe("Comma-separated file extensions to protect"),
      redirect_url: z.string().optional().describe("URL to redirect blocked requests to"),
    },
    async ({ urls, extensions, redirect_url }) => {
      const params: Record<string, string> = { urls, extensions };
      if (redirect_url) params.redirect_url = redirect_url;
      const result = await client.uapi("HotlinkProtection", "enable", params);
      return { content: [{ type: "text", text: "Hotlink protection enabled" }] };
    }
  );

  server.tool(
    "disable_hotlink_protection",
    "Disable hotlink protection",
    {},
    async () => {
      const result = await client.uapi("HotlinkProtection", "disable");
      return { content: [{ type: "text", text: "Hotlink protection disabled" }] };
    }
  );

  // --- Directory Privacy ---

  server.tool(
    "list_directory_privacy",
    "List directories with password protection configured",
    { path: z.string().default("/").describe("Directory to check") },
    async ({ path }) => {
      const result = await client.uapi("DirectoryPrivacy", "list_directories", { dir: path });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "add_directory_user",
    "Add a user to a password-protected directory",
    {
      dir: z.string().describe("Directory path to protect"),
      user: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
    async ({ dir, user, password }) => {
      const result = await client.uapi("DirectoryPrivacy", "add_user", {
        dir,
        user,
        password,
      });
      return { content: [{ type: "text", text: `User ${user} added to protected directory: ${dir}` }] };
    }
  );
}
