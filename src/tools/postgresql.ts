import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerPostgresqlTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_postgresql_databases",
    "List all PostgreSQL databases",
    {},
    async () => {
      const result = await client.uapi("Postgresql", "list_databases");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_postgresql_database",
    "Create a new PostgreSQL database",
    { name: z.string().describe("Database name") },
    async ({ name }) => {
      const result = await client.uapi("Postgresql", "create_database", { name });
      return { content: [{ type: "text", text: `PostgreSQL database created: ${name}` }] };
    }
  );

  server.tool(
    "delete_postgresql_database",
    "Delete a PostgreSQL database",
    { name: z.string().describe("Database name to delete") },
    async ({ name }) => {
      const result = await client.uapi("Postgresql", "delete_database", { name });
      return { content: [{ type: "text", text: `PostgreSQL database deleted: ${name}` }] };
    }
  );

  server.tool(
    "list_postgresql_users",
    "List all PostgreSQL users",
    {},
    async () => {
      const result = await client.uapi("Postgresql", "list_users");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_postgresql_user",
    "Create a new PostgreSQL user",
    {
      name: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
    async ({ name, password }) => {
      const result = await client.uapi("Postgresql", "create_user", { name, password });
      return { content: [{ type: "text", text: `PostgreSQL user created: ${name}` }] };
    }
  );

  server.tool(
    "delete_postgresql_user",
    "Delete a PostgreSQL user",
    { name: z.string().describe("Username to delete") },
    async ({ name }) => {
      const result = await client.uapi("Postgresql", "delete_user", { name });
      return { content: [{ type: "text", text: `PostgreSQL user deleted: ${name}` }] };
    }
  );

  server.tool(
    "set_postgresql_privileges",
    "Grant a PostgreSQL user access to a database",
    {
      user: z.string().describe("PostgreSQL username"),
      database: z.string().describe("Database name"),
    },
    async ({ user, database }) => {
      const result = await client.uapi("Postgresql", "grant_all_privileges", {
        user,
        database,
      });
      return { content: [{ type: "text", text: `PostgreSQL privileges granted for ${user} on ${database}` }] };
    }
  );

  server.tool(
    "revoke_postgresql_privileges",
    "Revoke a PostgreSQL user's access to a database",
    {
      user: z.string().describe("PostgreSQL username"),
      database: z.string().describe("Database name"),
    },
    async ({ user, database }) => {
      const result = await client.uapi("Postgresql", "revoke_all_privileges", {
        user,
        database,
      });
      return { content: [{ type: "text", text: `PostgreSQL privileges revoked for ${user} on ${database}` }] };
    }
  );
}
