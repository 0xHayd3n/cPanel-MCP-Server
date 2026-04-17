import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerCronTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_cron_jobs",
    "List all cron jobs on the account",
    {},
    async () => {
      const result = await client.api2("Cron", "fetchcron");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "create_cron_job",
    "Create a new cron job",
    {
      command: z.string().describe("Command to execute"),
      minute: z.string().default("0").describe("Minute (0-59 or *)"),
      hour: z.string().default("*").describe("Hour (0-23 or *)"),
      day: z.string().default("*").describe("Day of month (1-31 or *)"),
      month: z.string().default("*").describe("Month (1-12 or *)"),
      weekday: z.string().default("*").describe("Day of week (0-6, 0=Sunday, or *)"),
    },
    async ({ command, minute, hour, day, month, weekday }) => {
      const result = await client.api2("Cron", "add_line", {
        command,
        minute,
        hour,
        day,
        month,
        weekday,
      });
      return {
        content: [
          {
            type: "text",
            text: `Cron job created: ${minute} ${hour} ${day} ${month} ${weekday} ${command}`,
          },
        ],
      };
    }
  );

  server.tool(
    "edit_cron_job",
    "Edit an existing cron job",
    {
      linekey: z.string().describe("Unique line key of the cron job (from list_cron_jobs)"),
      command: z.string().describe("Command to execute"),
      minute: z.string().default("0").describe("Minute (0-59 or *)"),
      hour: z.string().default("*").describe("Hour (0-23 or *)"),
      day: z.string().default("*").describe("Day of month (1-31 or *)"),
      month: z.string().default("*").describe("Month (1-12 or *)"),
      weekday: z.string().default("*").describe("Day of week (0-6, 0=Sunday, or *)"),
    },
    async ({ linekey, command, minute, hour, day, month, weekday }) => {
      const result = await client.api2("Cron", "edit_line", {
        linekey,
        command,
        minute,
        hour,
        day,
        month,
        weekday,
      });
      return { content: [{ type: "text", text: `Cron job updated: ${linekey}` }] };
    }
  );

  server.tool(
    "delete_cron_job",
    "Delete a cron job",
    { linekey: z.string().describe("Unique line key of the cron job to delete") },
    async ({ linekey }) => {
      const result = await client.api2("Cron", "remove_line", { linekey });
      return { content: [{ type: "text", text: `Cron job deleted: ${linekey}` }] };
    }
  );

  server.tool(
    "get_cron_email",
    "Get the email address for cron job notifications",
    {},
    async () => {
      const result = await client.api2("Cron", "get_email");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "set_cron_email",
    "Set the email address for cron job notifications",
    { email: z.string().describe("Email address for cron notifications") },
    async ({ email }) => {
      const result = await client.api2("Cron", "set_email", { email });
      return { content: [{ type: "text", text: `Cron notification email set to: ${email}` }] };
    }
  );
}
