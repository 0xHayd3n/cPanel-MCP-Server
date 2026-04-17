import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { splitPath, validatePath } from "../validation.js";

export function registerFileTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_files",
    "List files and directories in a specified path",
    { path: z.string().default("/").describe("Directory path to list") },
    async ({ path }) =>
      handleToolCall(async () => {
        validatePath(path);
        const result = await client.uapi("Fileman", "list_files", {
          dir: path,
          include_mime: "1",
          include_permissions: "1",
        });
        return formatData(result.data);
      })
  );

  server.tool(
    "create_file",
    "Create a new file with specified content",
    {
      path: z.string().describe("Full file path including filename"),
      content: z.string().describe("File content"),
    },
    async ({ path, content }) =>
      handleToolCall(async () => {
        const { dir, file } = splitPath(path);
        const result = await client.uapi("Fileman", "save_file_content", {
          dir,
          file,
          content,
        });
        return formatSuccess(`File created: ${path}`, result.data);
      })
  );

  server.tool(
    "read_file",
    "Read the contents of a file",
    { path: z.string().describe("Full file path to read") },
    async ({ path }) =>
      handleToolCall(async () => {
        const { dir, file } = splitPath(path);
        const result = await client.uapi("Fileman", "get_file_content", {
          dir,
          file,
        });
        return formatData(result.data);
      })
  );

  server.tool(
    "edit_file",
    "Update the contents of an existing file",
    {
      path: z.string().describe("Full file path to edit"),
      content: z.string().describe("New file content"),
    },
    async ({ path, content }) =>
      handleToolCall(async () => {
        const { dir, file } = splitPath(path);
        const result = await client.uapi("Fileman", "save_file_content", {
          dir,
          file,
          content,
        });
        return formatSuccess(`File updated: ${path}`, result.data);
      })
  );

  server.tool(
    "delete_file",
    "Delete a file or directory",
    { path: z.string().describe("Full path to delete") },
    async ({ path }) =>
      handleToolCall(async () => {
        const { dir, file } = splitPath(path);
        const result = await client.uapi("Fileman", "trash", {
          dir,
          file,
        });
        return formatSuccess(`Deleted: ${path}`, result.data);
      })
  );
}
