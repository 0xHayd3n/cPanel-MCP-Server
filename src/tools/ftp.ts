import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerFtpTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_ftp_accounts",
    "List all FTP accounts with disk usage",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "list_ftp_with_disk");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_ftp_account",
    "Create a new FTP account",
    {
      user: z.string().describe("FTP username"),
      password: z.string().describe("FTP password"),
      quota: z.string().default("0").describe("Disk quota in MB (0 for unlimited)"),
      homedir: z.string().optional().describe("Home directory path (relative to account home)"),
      domain: z.string().optional().describe("Associated domain"),
    },
    async ({ user, password, quota, homedir, domain }) =>
      handleToolCall(async () => {
        const params: Record<string, string> = { user, pass: password, quota };
        if (homedir) params.homedir = homedir;
        if (domain) params.domain = domain;
        const result = await client.uapi("Ftp", "add_ftp", params);
        return formatSuccess(`FTP account created: ${user}`, result.data);
      })
  );

  server.tool(
    "delete_ftp_account",
    "Delete an FTP account",
    {
      user: z.string().describe("FTP username to delete"),
      domain: z.string().describe("Associated domain"),
      destroy: z.boolean().default(false).describe("Also delete the FTP user's home directory"),
    },
    async ({ user, domain, destroy }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "delete_ftp", {
          user,
          domain,
          destroy: destroy ? "1" : "0",
        });
        return formatSuccess(`FTP account deleted: ${user}@${domain}`, result.data);
      })
  );

  server.tool(
    "change_ftp_password",
    "Change an FTP account password",
    {
      user: z.string().describe("FTP username"),
      password: z.string().describe("New password"),
      domain: z.string().describe("Associated domain"),
    },
    async ({ user, password, domain }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "passwd", { user, pass: password, domain });
        return formatSuccess(`FTP password changed for: ${user}@${domain}`, result.data);
      })
  );

  server.tool(
    "change_ftp_quota",
    "Change an FTP account's disk quota",
    {
      user: z.string().describe("FTP username"),
      quota: z.string().describe("New quota in MB (0 for unlimited)"),
      domain: z.string().describe("Associated domain"),
    },
    async ({ user, quota, domain }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "set_quota", { user, quota, domain });
        return formatSuccess(`FTP quota updated for ${user}@${domain}: ${quota}MB`, result.data);
      })
  );

  server.tool(
    "list_ftp_sessions",
    "List active FTP sessions",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "list_sessions");
        return formatData(result.data);
      })
  );

  server.tool(
    "kill_ftp_session",
    "Terminate an active FTP session",
    { id: z.string().describe("Session ID to terminate (from list_ftp_sessions)") },
    async ({ id }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "kill_session", { id });
        return formatSuccess(`FTP session terminated: ${id}`, result.data);
      })
  );

  server.tool(
    "get_ftp_port",
    "Get the FTP server port number",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Ftp", "get_port");
        return formatData(result.data);
      })
  );
}
