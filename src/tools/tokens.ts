import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerTokenTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_api_tokens",
    "List all cPanel API tokens for the account",
    {},
    async () => {
      const result = await client.uapi("Tokens", "list");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_api_token",
    "Create a new cPanel API token with full access",
    { name: z.string().describe("Name/label for the new token") },
    async ({ name }) => {
      const result = await client.uapi("Tokens", "create_full_access", { name });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "rename_api_token",
    "Rename an existing API token",
    {
      name: z.string().describe("Current token name"),
      new_name: z.string().describe("New token name"),
    },
    async ({ name, new_name }) => {
      const result = await client.uapi("Tokens", "rename", { name, new_name });
      return { content: [{ type: "text", text: `API token renamed: ${name} → ${new_name}` }] };
    }
  );

  server.tool(
    "revoke_api_token",
    "Revoke/delete an API token",
    { name: z.string().describe("Token name to revoke") },
    async ({ name }) => {
      const result = await client.uapi("Tokens", "revoke", { name });
      return { content: [{ type: "text", text: `API token revoked: ${name}` }] };
    }
  );
}
