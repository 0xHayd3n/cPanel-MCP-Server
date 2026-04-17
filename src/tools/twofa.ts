import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerTwoFactorAuthTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_2fa_status",
    "Check if two-factor authentication is configured for the account",
    {},
    async () => {
      const result = await client.uapi("TwoFactorAuth", "get_user_configuration");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "generate_2fa_config",
    "Generate a new two-factor authentication secret (returns QR code data)",
    {},
    async () => {
      const result = await client.uapi("TwoFactorAuth", "generate_user_configuration");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "set_2fa",
    "Enable two-factor authentication with a secret and verification code",
    {
      secret: z.string().describe("The TOTP secret from generate_2fa_config"),
      code: z.string().describe("Current TOTP code from authenticator app to verify setup"),
    },
    async ({ secret, code }) => {
      const result = await client.uapi("TwoFactorAuth", "set_user_configuration", {
        secret,
        tfa_token: code,
      });
      return { content: [{ type: "text", text: "Two-factor authentication enabled" }] };
    }
  );

  server.tool(
    "remove_2fa",
    "Remove/disable two-factor authentication from the account",
    {},
    async () => {
      const result = await client.uapi("TwoFactorAuth", "remove_user_configuration");
      return { content: [{ type: "text", text: "Two-factor authentication removed" }] };
    }
  );
}
