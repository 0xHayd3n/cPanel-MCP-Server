import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validatePath } from "../validation.js";

export function registerBackupTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "create_full_backup",
    "Create a full account backup",
    {
      destination: z.enum(["homedir", "ftp", "scp"]).default("homedir").describe("Backup destination"),
      email: z.string().optional().describe("Email address to notify when backup completes"),
      server: z.string().optional().describe("Remote server address (for FTP/SCP)"),
      user: z.string().optional().describe("Remote server username (for FTP/SCP)"),
      password: z.string().optional().describe("Remote server password (for FTP/SCP)"),
      port: z.string().optional().describe("Remote server port (for FTP/SCP)"),
      rdir: z.string().optional().describe("Remote directory path (for FTP/SCP)"),
    },
    async ({ destination, email, server: remoteServer, user, password, port, rdir }) =>
      handleToolCall(async () => {
        if (destination === "homedir") {
          const params: Record<string, string> = {};
          if (email) params.email = email;
          const result = await client.uapi("Backup", "fullbackup_to_homedir", params);
          return formatSuccess(
            "Full backup initiated to home directory. You will be notified when complete.",
            result.data
          );
        }

        if (destination === "ftp") {
          const params: Record<string, string> = {};
          if (remoteServer) params.server = remoteServer;
          if (user) params.user = user;
          if (password) params.pass = password;
          if (port) params.port = port;
          if (rdir) params.rdir = rdir;
          if (email) params.email = email;
          const result = await client.uapi("Backup", "fullbackup_to_ftp", params);
          return formatSuccess("Full backup initiated to FTP server.", result.data);
        }

        // SCP
        const params: Record<string, string> = {};
        if (remoteServer) params.server = remoteServer;
        if (user) params.user = user;
        if (password) params.pass = password;
        if (port) params.port = port;
        if (rdir) params.rdir = rdir;
        if (email) params.email = email;
        const result = await client.uapi(
          "Backup",
          "fullbackup_to_scp_with_password",
          params
        );
        return formatSuccess("Full backup initiated to SCP server.", result.data);
      })
  );

  server.tool(
    "list_backups",
    "List available backups on the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Backup", "list_backups");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_database_backup",
    "Create a backup of a specific MySQL database",
    { database: z.string().describe("Database name to backup") },
    async ({ database }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Backup", "create_database_backup", { db: database });
        return formatSuccess(`Database backup created for: ${database}`, result.data);
      })
  );

  server.tool(
    "restore_database_backup",
    "Restore a MySQL database from a backup file",
    {
      backup_file: z.string().describe("Path to the backup file"),
      timeout: z.string().default("300").describe("Restore timeout in seconds"),
    },
    async ({ backup_file, timeout }) =>
      handleToolCall(async () => {
        validatePath(backup_file);
        const result = await client.uapi("Backup", "restore_databases", {
          backup: backup_file,
          timeout,
        });
        return formatSuccess(`Database restore initiated from: ${backup_file}`, result.data);
      })
  );

  server.tool(
    "create_homedir_backup",
    "Create a backup of the home directory files",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Backup", "create_homedir_backup");
        return formatSuccess("Home directory backup created", result.data);
      })
  );

  server.tool(
    "restore_file_backup",
    "Restore a file from a backup",
    {
      backup_file: z.string().describe("Path to the backup file to restore"),
      directory: z.string().default("/").describe("Directory to restore files to"),
    },
    async ({ backup_file, directory }) =>
      handleToolCall(async () => {
        validatePath(backup_file);
        validatePath(directory);
        const result = await client.uapi("Backup", "restore_files", {
          backup: backup_file,
          directory,
        });
        return formatSuccess(`File restore initiated from: ${backup_file}`, result.data);
      })
  );

  server.tool(
    "create_email_backup",
    "Create a backup of email configurations and data",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Backup", "create_email_backup");
        return formatSuccess("Email backup created", result.data);
      })
  );
}
