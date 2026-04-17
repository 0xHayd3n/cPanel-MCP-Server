import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerPostgresqlTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_postgresql_databases",
    "List all PostgreSQL databases",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "list_databases");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_postgresql_database",
    "Create a new PostgreSQL database",
    { name: z.string().describe("Database name") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "create_database", { name });
        return formatSuccess(`PostgreSQL database created: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_postgresql_database",
    "Delete a PostgreSQL database",
    { name: z.string().describe("Database name to delete") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "delete_database", { name });
        return formatSuccess(`PostgreSQL database deleted: ${name}`, result.data);
      })
  );

  server.tool(
    "list_postgresql_users",
    "List all PostgreSQL users",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "list_users");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_postgresql_user",
    "Create a new PostgreSQL user",
    {
      name: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
    async ({ name, password }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "create_user", { name, password });
        return formatSuccess(`PostgreSQL user created: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_postgresql_user",
    "Delete a PostgreSQL user",
    { name: z.string().describe("Username to delete") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "delete_user", { name });
        return formatSuccess(`PostgreSQL user deleted: ${name}`, result.data);
      })
  );

  server.tool(
    "set_postgresql_privileges",
    "Grant a PostgreSQL user access to a database",
    {
      user: z.string().describe("PostgreSQL username"),
      database: z.string().describe("Database name"),
    },
    async ({ user, database }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "grant_all_privileges", { user, database });
        return formatSuccess(`PostgreSQL privileges granted for ${user} on ${database}`, result.data);
      })
  );

  server.tool(
    "revoke_postgresql_privileges",
    "Revoke a PostgreSQL user's access to a database",
    {
      user: z.string().describe("PostgreSQL username"),
      database: z.string().describe("Database name"),
    },
    async ({ user, database }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Postgresql", "revoke_all_privileges", { user, database });
        return formatSuccess(`PostgreSQL privileges revoked for ${user} on ${database}`, result.data);
      })
  );
}
