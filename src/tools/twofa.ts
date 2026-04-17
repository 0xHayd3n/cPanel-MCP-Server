import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerTwoFactorAuthTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "get_2fa_status",
    "Check if two-factor authentication is configured for the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("TwoFactorAuth", "get_user_configuration");
        return formatData(result.data);
      })
  );

  server.tool(
    "generate_2fa_config",
    "Generate a new two-factor authentication secret (returns QR code data)",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("TwoFactorAuth", "generate_user_configuration");
        return formatData(result.data);
      })
  );

  server.tool(
    "set_2fa",
    "Enable two-factor authentication with a secret and verification code",
    {
      secret: z.string().describe("The TOTP secret from generate_2fa_config"),
      code: z.string().describe("Current TOTP code from authenticator app to verify setup"),
    },
    async ({ secret, code }) =>
      handleToolCall(async () => {
        const result = await client.uapi("TwoFactorAuth", "set_user_configuration", {
          secret,
          tfa_token: code,
        });
        return formatSuccess("Two-factor authentication enabled", result.data);
      })
  );

  server.tool(
    "remove_2fa",
    "Remove/disable two-factor authentication from the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("TwoFactorAuth", "remove_user_configuration");
        return formatSuccess("Two-factor authentication removed", result.data);
      })
  );
}
