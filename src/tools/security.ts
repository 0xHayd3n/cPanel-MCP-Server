import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateIp, validatePath } from "../validation.js";

export function registerSecurityTools(server: McpServer, client: CpanelClient) {
  // --- IP Blocker ---

  server.tool(
    "list_blocked_ips",
    "List all blocked IP addresses",
    {},
    async () =>
      handleToolCall(async () => {
        const data = await client.api2("DenyIp", "listdenyips");
        return formatData(data);
      })
  );

  server.tool(
    "block_ip",
    "Block an IP address or range",
    { ip: z.string().describe("IP address, range (e.g., 10.0.0.0/24), or CIDR notation") },
    async ({ ip }) =>
      handleToolCall(async () => {
        const validIp = validateIp(ip);
        const result = await client.uapi("BlockIP", "add_ip", { ip: validIp });
        return formatSuccess(`IP blocked: ${validIp}`, result.data);
      })
  );

  server.tool(
    "unblock_ip",
    "Unblock a previously blocked IP address",
    { ip: z.string().describe("IP address or range to unblock") },
    async ({ ip }) =>
      handleToolCall(async () => {
        const validIp = validateIp(ip);
        const result = await client.uapi("BlockIP", "remove_ip", { ip: validIp });
        return formatSuccess(`IP unblocked: ${validIp}`, result.data);
      })
  );

  // --- SSH Keys ---

  server.tool(
    "list_ssh_keys",
    "List all SSH keys on the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SSH", "list_keys");
        return formatData(result.data);
      })
  );

  server.tool(
    "import_ssh_key",
    "Import an SSH public or private key",
    {
      name: z.string().describe("Key name/identifier"),
      key: z.string().describe("Key content"),
      type: z.enum(["rsa", "dsa"]).default("rsa").describe("Key type"),
    },
    async ({ name, key, type }) =>
      handleToolCall(async () => {
        const result = await client.uapi("SSH", "import_key", { name, key, type });
        return formatSuccess(`SSH key imported: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_ssh_key",
    "Delete an SSH key",
    {
      name: z.string().describe("Key name to delete"),
      type: z.enum(["public", "private"]).describe("Whether to delete public or private key"),
    },
    async ({ name, type }) =>
      handleToolCall(async () => {
        const isPublic = type === "public" ? "1" : "0";
        const result = await client.uapi("SSH", "delete_key", { name, pub: isPublic });
        return formatSuccess(`SSH ${type} key deleted: ${name}`, result.data);
      })
  );

  server.tool(
    "authorize_ssh_key",
    "Authorize an SSH key for login",
    { name: z.string().describe("Key name to authorize") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("SSH", "authorize_key", { name });
        return formatSuccess(`SSH key authorized: ${name}`, result.data);
      })
  );

  server.tool(
    "deauthorize_ssh_key",
    "Deauthorize an SSH key (revoke login access)",
    { name: z.string().describe("Key name to deauthorize") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("SSH", "deauthorize_key", { name });
        return formatSuccess(`SSH key deauthorized: ${name}`, result.data);
      })
  );

  // --- Hotlink Protection ---

  server.tool(
    "get_hotlink_protection",
    "Get current hotlink protection settings",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("HotlinkProtection", "get");
        return formatData(result.data);
      })
  );

  server.tool(
    "enable_hotlink_protection",
    "Enable hotlink protection",
    {
      urls: z.string().describe("Comma-separated list of allowed referrer URLs"),
      extensions: z.string().default("jpg,jpeg,gif,png,bmp,svg").describe("Comma-separated file extensions to protect"),
      redirect_url: z.string().optional().describe("URL to redirect blocked requests to"),
    },
    async ({ urls, extensions, redirect_url }) =>
      handleToolCall(async () => {
        const params: Record<string, string> = { urls, extensions };
        if (redirect_url) params.redirect_url = redirect_url;
        const result = await client.uapi("HotlinkProtection", "enable", params);
        return formatSuccess("Hotlink protection enabled", result.data);
      })
  );

  server.tool(
    "disable_hotlink_protection",
    "Disable hotlink protection",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("HotlinkProtection", "disable");
        return formatSuccess("Hotlink protection disabled", result.data);
      })
  );

  // --- Directory Privacy ---

  server.tool(
    "list_directory_privacy",
    "List directories with password protection configured",
    { path: z.string().default("/").describe("Directory to check") },
    async ({ path }) =>
      handleToolCall(async () => {
        validatePath(path);
        const result = await client.uapi("DirectoryPrivacy", "list_directories", { dir: path });
        return formatData(result.data);
      })
  );

  server.tool(
    "add_directory_user",
    "Add a user to a password-protected directory",
    {
      dir: z.string().describe("Directory path to protect"),
      user: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
    async ({ dir, user, password }) =>
      handleToolCall(async () => {
        validatePath(dir);
        const result = await client.uapi("DirectoryPrivacy", "add_user", { dir, user, password });
        return formatSuccess(`User ${user} added to protected directory: ${dir}`, result.data);
      })
  );
}
