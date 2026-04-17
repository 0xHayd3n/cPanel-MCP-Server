import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validatePath } from "../validation.js";

export function registerVirusScannerTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "start_virus_scan",
    "Start a ClamAV virus scan on a directory (requires ClamAV plugin on server)",
    { path: z.string().default("/home").describe("Directory path to scan") },
    async ({ path }) =>
      handleToolCall(async () => {
        validatePath(path);
        const result = await client.uapi("ClamScanner", "start_scan", { path });
        return formatSuccess(`Virus scan started on: ${path}`, result.data);
      })
  );

  server.tool(
    "get_virus_scan_status",
    "Check the status of a running virus scan",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ClamScanner", "get_scan_status");
        return formatData(result.data);
      })
  );

  server.tool(
    "list_infected_files",
    "List files detected as infected by ClamAV",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ClamScanner", "list_infected_files");
        return formatData(result.data);
      })
  );

  server.tool(
    "disinfect_files",
    "Quarantine/disinfect files detected as infected",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("ClamScanner", "disinfect_files");
        return formatSuccess("Infected files have been quarantined/disinfected", result.data);
      })
  );
}
