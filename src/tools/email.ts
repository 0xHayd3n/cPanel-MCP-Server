import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerEmailTools(server: McpServer, client: CpanelClient) {
  // --- Email Accounts ---

  server.tool(
    "list_email_accounts",
    "List all email accounts with disk usage info",
    {},
    async () => {
      const result = await client.uapi("Email", "list_pops_with_disk");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_email_account",
    "Create a new email account",
    {
      email: z.string().describe("Email address (user@domain.com)"),
      password: z.string().describe("Password for the email account"),
      quota: z.string().default("1024").describe("Mailbox quota in MB (0 for unlimited)"),
    },
    async ({ email, password, quota }) => {
      const [user, domain] = email.split("@");
      const result = await client.uapi("Email", "add_pop", {
        email: user,
        domain,
        password,
        quota: quota,
      });
      return { content: [{ type: "text", text: `Email account created: ${email}` }] };
    }
  );

  server.tool(
    "delete_email_account",
    "Delete an email account",
    { email: z.string().describe("Email address to delete (user@domain.com)") },
    async ({ email }) => {
      const [user, domain] = email.split("@");
      const result = await client.uapi("Email", "delete_pop", {
        email: user,
        domain,
      });
      return { content: [{ type: "text", text: `Email account deleted: ${email}` }] };
    }
  );

  server.tool(
    "change_email_password",
    "Change password for an email account",
    {
      email: z.string().describe("Email address (user@domain.com)"),
      password: z.string().describe("New password"),
    },
    async ({ email, password }) => {
      const [user, domain] = email.split("@");
      const result = await client.uapi("Email", "passwd_pop", {
        email: user,
        domain,
        password,
      });
      return { content: [{ type: "text", text: `Password changed for: ${email}` }] };
    }
  );

  server.tool(
    "change_email_quota",
    "Change mailbox quota for an email account",
    {
      email: z.string().describe("Email address (user@domain.com)"),
      quota: z.string().describe("New quota in MB (0 for unlimited)"),
    },
    async ({ email, quota }) => {
      const [user, domain] = email.split("@");
      const result = await client.uapi("Email", "edit_pop_quota", {
        email: user,
        domain,
        quota,
      });
      return { content: [{ type: "text", text: `Quota updated for ${email}: ${quota}MB` }] };
    }
  );

  // --- Forwarders ---

  server.tool(
    "list_email_forwarders",
    "List all email forwarders",
    {},
    async () => {
      const result = await client.uapi("Email", "list_forwarders");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_email_forwarder",
    "Create an email forwarder",
    {
      email: z.string().describe("Email address to forward from (user@domain.com)"),
      forward_to: z.string().describe("Destination email address"),
    },
    async ({ email, forward_to }) => {
      const domain = email.split("@")[1];
      const result = await client.uapi("Email", "add_forwarder", {
        domain,
        email,
        fwdopt: "fwd",
        fwdemail: forward_to,
      });
      return { content: [{ type: "text", text: `Forwarder created: ${email} → ${forward_to}` }] };
    }
  );

  server.tool(
    "delete_email_forwarder",
    "Delete an email forwarder",
    {
      email: z.string().describe("Forwarder source address"),
      forward_to: z.string().describe("Forwarder destination to remove"),
    },
    async ({ email, forward_to }) => {
      const result = await client.uapi("Email", "delete_forwarder", {
        address: email,
        forwarder: forward_to,
      });
      return { content: [{ type: "text", text: `Forwarder deleted: ${email} → ${forward_to}` }] };
    }
  );

  // --- Autoresponders ---

  server.tool(
    "list_autoresponders",
    "List all email autoresponders",
    {},
    async () => {
      const result = await client.uapi("Email", "list_auto_responders");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_autoresponder",
    "Create an email autoresponder",
    {
      email: z.string().describe("Email address (user@domain.com)"),
      from: z.string().describe("From name for the autoresponse"),
      subject: z.string().describe("Autoresponse subject line"),
      body: z.string().describe("Autoresponse body text"),
      interval: z.string().default("24").describe("Hours between autoresponses to same sender"),
    },
    async ({ email, from, subject, body, interval }) => {
      const [user, domain] = email.split("@");
      const result = await client.uapi("Email", "add_auto_responder", {
        email: user,
        domain,
        from,
        subject,
        body,
        interval,
      });
      return { content: [{ type: "text", text: `Autoresponder created for: ${email}` }] };
    }
  );

  server.tool(
    "delete_autoresponder",
    "Delete an email autoresponder",
    { email: z.string().describe("Email address (user@domain.com)") },
    async ({ email }) => {
      const result = await client.uapi("Email", "delete_auto_responder", {
        email,
      });
      return { content: [{ type: "text", text: `Autoresponder deleted for: ${email}` }] };
    }
  );

  // --- Email Routing ---

  server.tool(
    "get_email_routing",
    "Get email routing configuration for a domain",
    { domain: z.string().describe("Domain name") },
    async ({ domain }) => {
      const result = await client.uapi("Email", "list_mail_domains");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
