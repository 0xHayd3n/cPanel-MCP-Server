import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerEmailFilterTools(server: McpServer, client: CpanelClient) {
  // --- Email Filters ---

  server.tool(
    "list_email_filters",
    "List all email filters for an account",
    { account: z.string().describe("Email account (user@domain.com) or empty for main account") },
    async ({ account }) => {
      const result = await client.uapi("Email", "list_filters", { account });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "delete_email_filter",
    "Delete an email filter",
    {
      account: z.string().describe("Email account (user@domain.com)"),
      filtername: z.string().describe("Name of the filter to delete"),
    },
    async ({ account, filtername }) => {
      const result = await client.uapi("Email", "delete_filter", {
        account,
        filtername,
      });
      return { content: [{ type: "text", text: `Email filter deleted: ${filtername}` }] };
    }
  );

  server.tool(
    "trace_email_filter",
    "Test email filters against a message to see which rules match",
    {
      account: z.string().describe("Email account (user@domain.com)"),
      msg: z.string().describe("Test message content to trace through filters"),
    },
    async ({ account, msg }) => {
      const result = await client.uapi("Email", "trace_filter", { account, msg });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  // --- SpamAssassin ---

  server.tool(
    "enable_spam_assassin",
    "Enable SpamAssassin spam filtering for the account",
    {},
    async () => {
      const result = await client.uapi("Email", "enable_spam_assassin");
      return { content: [{ type: "text", text: "SpamAssassin enabled" }] };
    }
  );

  server.tool(
    "disable_spam_assassin",
    "Disable SpamAssassin spam filtering",
    {},
    async () => {
      const result = await client.uapi("Email", "disable_spam_assassin");
      return { content: [{ type: "text", text: "SpamAssassin disabled" }] };
    }
  );

  server.tool(
    "enable_spam_box",
    "Enable the spam box (auto-deliver spam to a separate folder)",
    {},
    async () => {
      const result = await client.uapi("Email", "enable_spam_box");
      return { content: [{ type: "text", text: "Spam box enabled — spam will be delivered to a spam folder" }] };
    }
  );

  server.tool(
    "disable_spam_box",
    "Disable the spam box",
    {},
    async () => {
      const result = await client.uapi("Email", "disable_spam_box");
      return { content: [{ type: "text", text: "Spam box disabled" }] };
    }
  );

  server.tool(
    "get_spam_settings",
    "Get SpamAssassin settings and score threshold",
    {},
    async () => {
      const result = await client.uapi("Email", "get_spam_settings");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "clear_spam_box",
    "Clear all messages from the SpamAssassin spam box",
    {},
    async () => {
      const result = await client.uapi("SpamAssassin", "clear_spam_box");
      return { content: [{ type: "text", text: "Spam box cleared" }] };
    }
  );

  // --- Greylisting ---

  server.tool(
    "get_greylisting_status",
    "Check if greylisting is enabled for the account",
    {},
    async () => {
      const result = await client.uapi("cPGreyList", "has_greylisting_enabled");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "enable_greylisting",
    "Enable greylisting for all domains (delays first-time senders to block spam)",
    {},
    async () => {
      const result = await client.uapi("cPGreyList", "enable_all_domains");
      return { content: [{ type: "text", text: "Greylisting enabled for all domains" }] };
    }
  );

  server.tool(
    "disable_greylisting",
    "Disable greylisting for all domains",
    {},
    async () => {
      const result = await client.uapi("cPGreyList", "disable_all_domains");
      return { content: [{ type: "text", text: "Greylisting disabled for all domains" }] };
    }
  );
}
