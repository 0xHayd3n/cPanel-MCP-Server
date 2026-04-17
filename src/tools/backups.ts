import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

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
    async ({ destination, email, server: remoteServer, user, password, port, rdir }) => {
      const params: Record<string, string> = { dest: destination };
      if (email) params.email = email;
      if (remoteServer) params.server = remoteServer;
      if (user) params.user = user;
      if (password) params.pass = password;
      if (port) params.port = port;
      if (rdir) params.rdir = rdir;

      const result = await client.uapi("Backup", "fullbackup_to_homedir");
      return { content: [{ type: "text", text: "Full backup initiated. Check your home directory for the backup file." }] };
    }
  );

  server.tool(
    "list_backups",
    "List available backups on the account",
    {},
    async () => {
      const result = await client.uapi("Backup", "list_backups");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_database_backup",
    "Create a backup of a specific MySQL database",
    { database: z.string().describe("Database name to backup") },
    async ({ database }) => {
      const result = await client.uapi("Backup", "create_database_backup", {
        db: database,
      });
      return { content: [{ type: "text", text: `Database backup created for: ${database}` }] };
    }
  );

  server.tool(
    "restore_database_backup",
    "Restore a MySQL database from a backup file",
    {
      backup_file: z.string().describe("Path to the backup file"),
      timeout: z.string().default("300").describe("Restore timeout in seconds"),
    },
    async ({ backup_file, timeout }) => {
      const result = await client.uapi("Backup", "restore_databases", {
        backup: backup_file,
        timeout,
      });
      return { content: [{ type: "text", text: `Database restore initiated from: ${backup_file}` }] };
    }
  );

  server.tool(
    "create_homedir_backup",
    "Create a backup of the home directory files",
    {},
    async () => {
      const result = await client.uapi("Backup", "create_homedir_backup");
      return { content: [{ type: "text", text: "Home directory backup created" }] };
    }
  );

  server.tool(
    "restore_file_backup",
    "Restore a file from a backup",
    {
      backup_file: z.string().describe("Path to the backup file to restore"),
      directory: z.string().default("/").describe("Directory to restore files to"),
    },
    async ({ backup_file, directory }) => {
      const result = await client.uapi("Backup", "restore_files", {
        backup: backup_file,
        directory,
      });
      return { content: [{ type: "text", text: `File restore initiated from: ${backup_file}` }] };
    }
  );

  server.tool(
    "create_email_backup",
    "Create a backup of email configurations and data",
    {},
    async () => {
      const result = await client.uapi("Backup", "create_email_backup");
      return { content: [{ type: "text", text: "Email backup created" }] };
    }
  );
}
