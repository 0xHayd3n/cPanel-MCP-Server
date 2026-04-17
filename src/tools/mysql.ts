import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerMysqlTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_mysql_databases",
    "List all MySQL databases on the account",
    {},
    async () => {
      const result = await client.uapi("Mysql", "list_databases");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_mysql_database",
    "Create a new MySQL database",
    { name: z.string().describe("Database name (will be prefixed with cPanel username)") },
    async ({ name }) => {
      const result = await client.uapi("Mysql", "create_database", { name });
      return { content: [{ type: "text", text: `Database created: ${name}` }] };
    }
  );

  server.tool(
    "delete_mysql_database",
    "Delete a MySQL database",
    { name: z.string().describe("Full database name to delete") },
    async ({ name }) => {
      const result = await client.uapi("Mysql", "delete_database", { name });
      return { content: [{ type: "text", text: `Database deleted: ${name}` }] };
    }
  );

  server.tool(
    "list_mysql_users",
    "List all MySQL database users",
    {},
    async () => {
      const result = await client.uapi("Mysql", "list_users");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_mysql_user",
    "Create a new MySQL database user",
    {
      name: z.string().describe("Username (will be prefixed with cPanel username)"),
      password: z.string().describe("Password for the new user"),
    },
    async ({ name, password }) => {
      const result = await client.uapi("Mysql", "create_user", { name, password });
      return { content: [{ type: "text", text: `MySQL user created: ${name}` }] };
    }
  );

  server.tool(
    "delete_mysql_user",
    "Delete a MySQL database user",
    { name: z.string().describe("Full username to delete") },
    async ({ name }) => {
      const result = await client.uapi("Mysql", "delete_user", { name });
      return { content: [{ type: "text", text: `MySQL user deleted: ${name}` }] };
    }
  );

  server.tool(
    "set_mysql_privileges",
    "Set privileges for a MySQL user on a database",
    {
      user: z.string().describe("Full MySQL username"),
      database: z.string().describe("Full database name"),
      privileges: z.string().default("ALL PRIVILEGES").describe("Comma-separated privileges or ALL PRIVILEGES"),
    },
    async ({ user, database, privileges }) => {
      const result = await client.uapi("Mysql", "set_privileges_on_database", {
        user,
        database,
        privileges,
      });
      return { content: [{ type: "text", text: `Privileges set for ${user} on ${database}` }] };
    }
  );

  server.tool(
    "revoke_mysql_privileges",
    "Revoke all privileges for a MySQL user on a database",
    {
      user: z.string().describe("Full MySQL username"),
      database: z.string().describe("Full database name"),
    },
    async ({ user, database }) => {
      const result = await client.uapi("Mysql", "revoke_access_to_database", {
        user,
        database,
      });
      return { content: [{ type: "text", text: `Privileges revoked for ${user} on ${database}` }] };
    }
  );

  server.tool(
    "get_mysql_server_info",
    "Get MySQL server information and restrictions",
    {},
    async () => {
      const result = await client.uapi("Mysql", "get_server_information");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );
}
