import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerFileTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_files",
    "List files and directories in a specified path",
    { path: z.string().default("/").describe("Directory path to list") },
    async ({ path }) => {
      const result = await client.uapi("Fileman", "list_files", {
        dir: path,
        include_mime: "1",
        include_permissions: "1",
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "create_file",
    "Create a new file with specified content",
    {
      path: z.string().describe("Full file path including filename"),
      content: z.string().describe("File content"),
    },
    async ({ path, content }) => {
      const dir = path.substring(0, path.lastIndexOf("/")) || "/";
      const filename = path.substring(path.lastIndexOf("/") + 1);
      const result = await client.uapi("Fileman", "save_file_content", {
        dir,
        file: filename,
        content,
      });
      return { content: [{ type: "text", text: `File created: ${path}` }] };
    }
  );

  server.tool(
    "read_file",
    "Read the contents of a file",
    { path: z.string().describe("Full file path to read") },
    async ({ path }) => {
      const dir = path.substring(0, path.lastIndexOf("/")) || "/";
      const filename = path.substring(path.lastIndexOf("/") + 1);
      const result = await client.uapi("Fileman", "get_file_content", {
        dir,
        file: filename,
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "edit_file",
    "Update the contents of an existing file",
    {
      path: z.string().describe("Full file path to edit"),
      content: z.string().describe("New file content"),
    },
    async ({ path, content }) => {
      const dir = path.substring(0, path.lastIndexOf("/")) || "/";
      const filename = path.substring(path.lastIndexOf("/") + 1);
      const result = await client.uapi("Fileman", "save_file_content", {
        dir,
        file: filename,
        content,
      });
      return { content: [{ type: "text", text: `File updated: ${path}` }] };
    }
  );

  server.tool(
    "delete_file",
    "Delete a file or directory",
    { path: z.string().describe("Full path to delete") },
    async ({ path }) => {
      const dir = path.substring(0, path.lastIndexOf("/")) || "/";
      const filename = path.substring(path.lastIndexOf("/") + 1);
      const result = await client.uapi("Fileman", "trash", {
        dir,
        file: filename,
      });
      return { content: [{ type: "text", text: `Deleted: ${path}` }] };
    }
  );
}
