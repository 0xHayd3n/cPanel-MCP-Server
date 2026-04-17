import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerEmailFilterTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_email_filters",
    "List all email filters for an account",
    { account: z.string().describe("Email account (user@domain.com) or empty for main account") },
    async ({ account }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "list_filters", { account });
        return formatData(result.data);
      })
  );

  server.tool(
    "delete_email_filter",
    "Delete an email filter",
    {
      account: z.string().describe("Email account (user@domain.com)"),
      filtername: z.string().describe("Name of the filter to delete"),
    },
    async ({ account, filtername }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "delete_filter", { account, filtername });
        return formatSuccess(`Email filter deleted: ${filtername}`, result.data);
      })
  );

  server.tool(
    "trace_email_filter",
    "Test email filters against a message to see which rules match",
    {
      account: z.string().describe("Email account (user@domain.com)"),
      msg: z.string().describe("Test message content to trace through filters"),
    },
    async ({ account, msg }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "trace_filter", { account, msg });
        return formatData(result.data);
      })
  );

  // --- SpamAssassin ---

  server.tool(
    "enable_spam_assassin",
    "Enable SpamAssassin spam filtering for the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "enable_spam_assassin");
        return formatSuccess("SpamAssassin enabled", result.data);
      })
  );

  server.tool(
    "disable_spam_assassin",
    "Disable SpamAssassin spam filtering",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "disable_spam_assassin");
        return formatSuccess("SpamAssassin disabled", result.data);
      })
  );

  server.tool(
    "enable_spam_box",
    "Enable the spam box (auto-deliver spam to a separate folder)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "enable_spam_box");
        return formatSuccess("Spam box enabled — spam will be delivered to a spam folder", result.data);
      })
  );

  server.tool(
    "disable_spam_box",
    "Disable the spam box",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "disable_spam_box");
        return formatSuccess("Spam box disabled", result.data);
      })
  );

  server.tool(
    "get_spam_settings",
    "Get SpamAssassin settings and score threshold",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Email", "get_spam_settings");
        return formatData(result.data);
      })
  );

  server.tool(
    "clear_spam_box",
    "Clear all messages from the SpamAssassin spam box",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("SpamAssassin", "clear_spam_box");
        return formatSuccess("Spam box cleared", result.data);
      })
  );

  // --- Greylisting ---

  server.tool(
    "get_greylisting_status",
    "Check if greylisting is enabled for the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("cPGreyList", "has_greylisting_enabled");
        return formatData(result.data);
      })
  );

  server.tool(
    "enable_greylisting",
    "Enable greylisting for all domains (delays first-time senders to block spam)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("cPGreyList", "enable_all_domains");
        return formatSuccess("Greylisting enabled for all domains", result.data);
      })
  );

  server.tool(
    "disable_greylisting",
    "Disable greylisting for all domains",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("cPGreyList", "disable_all_domains");
        return formatSuccess("Greylisting disabled for all domains", result.data);
      })
  );
}
