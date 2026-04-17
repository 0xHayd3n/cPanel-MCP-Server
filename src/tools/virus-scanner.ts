import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";

export function registerVirusScannerTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "start_virus_scan",
    "Start a ClamAV virus scan on a directory",
    { path: z.string().default("/home").describe("Directory path to scan") },
    async ({ path }) => {
      const result = await client.uapi("ClamScanner", "start_scan", { path });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "get_virus_scan_status",
    "Check the status of a running virus scan",
    {},
    async () => {
      const result = await client.uapi("ClamScanner", "get_scan_status");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "list_infected_files",
    "List files detected as infected by ClamAV",
    {},
    async () => {
      const result = await client.uapi("ClamScanner", "list_infected_files");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }] };
    }
  );

  server.tool(
    "disinfect_files",
    "Quarantine/disinfect files detected as infected",
    {},
    async () => {
      const result = await client.uapi("ClamScanner", "disinfect_files");
      return { content: [{ type: "text", text: "Infected files have been quarantined/disinfected" }] };
    }
  );
}
