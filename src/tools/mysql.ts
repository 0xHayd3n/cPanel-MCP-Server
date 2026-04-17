import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";

export function registerMysqlTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_mysql_databases",
    "List all MySQL databases on the account",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "list_databases");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_mysql_database",
    "Create a new MySQL database",
    { name: z.string().describe("Database name (will be prefixed with cPanel username)") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "create_database", { name });
        return formatSuccess(`Database created: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_mysql_database",
    "Delete a MySQL database",
    { name: z.string().describe("Full database name to delete") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "delete_database", { name });
        return formatSuccess(`Database deleted: ${name}`, result.data);
      })
  );

  server.tool(
    "list_mysql_users",
    "List all MySQL database users",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "list_users");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_mysql_user",
    "Create a new MySQL database user",
    {
      name: z.string().describe("Username (will be prefixed with cPanel username)"),
      password: z.string().describe("Password for the new user"),
    },
    async ({ name, password }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "create_user", { name, password });
        return formatSuccess(`MySQL user created: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_mysql_user",
    "Delete a MySQL database user",
    { name: z.string().describe("Full username to delete") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "delete_user", { name });
        return formatSuccess(`MySQL user deleted: ${name}`, result.data);
      })
  );

  server.tool(
    "set_mysql_privileges",
    "Set privileges for a MySQL user on a database",
    {
      user: z.string().describe("Full MySQL username"),
      database: z.string().describe("Full database name"),
      privileges: z.string().default("ALL PRIVILEGES").describe("Comma-separated privileges or ALL PRIVILEGES"),
    },
    async ({ user, database, privileges }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "set_privileges_on_database", {
          user,
          database,
          privileges,
        });
        return formatSuccess(`Privileges set for ${user} on ${database}`, result.data);
      })
  );

  server.tool(
    "revoke_mysql_privileges",
    "Revoke all privileges for a MySQL user on a database",
    {
      user: z.string().describe("Full MySQL username"),
      database: z.string().describe("Full database name"),
    },
    async ({ user, database }) =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "revoke_access_to_database", {
          user,
          database,
        });
        return formatSuccess(`Privileges revoked for ${user} on ${database}`, result.data);
      })
  );

  server.tool(
    "get_mysql_server_info",
    "Get MySQL server information and restrictions",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("Mysql", "get_server_information");
        return formatData(result.data);
      })
  );
}
