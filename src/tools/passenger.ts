import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain, validatePath } from "../validation.js";

export function registerPassengerTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_passenger_apps",
    "List all registered Node.js/Python/Ruby applications",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("PassengerApps", "list_applications");
        return formatData(result.data);
      })
  );

  server.tool(
    "register_passenger_app",
    "Register a new Node.js, Python, or Ruby application",
    {
      name: z.string().describe("Application name"),
      path: z.string().describe("Application root path (e.g., /home/user/myapp)"),
      domain: z.string().describe("Domain to deploy on"),
      deployment_mode: z.enum(["production", "development"]).default("production").describe("Deployment mode"),
      base_uri: z.string().default("/").describe("Base URI path"),
      python_path: z.string().optional().describe("Path to Python binary (for Python apps)"),
      nodejs_version: z.string().optional().describe("Node.js version (for Node.js apps)"),
    },
    async ({ name, path, domain, deployment_mode, base_uri, python_path, nodejs_version }) =>
      handleToolCall(async () => {
        validatePath(path);
        const d = validateDomain(domain);
        const params: Record<string, string> = {
          name,
          path,
          domain: d,
          deployment_mode,
          base_uri,
        };
        if (python_path) params.python_path = python_path;
        if (nodejs_version) params.nodejs_version = nodejs_version;
        const result = await client.uapi("PassengerApps", "register_application", params);
        return formatSuccess(`Application registered: ${name} on ${d}`, result.data);
      })
  );

  server.tool(
    "unregister_passenger_app",
    "Unregister/remove a Node.js, Python, or Ruby application",
    { name: z.string().describe("Application name to remove") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("PassengerApps", "unregister_application", { name });
        return formatSuccess(`Application unregistered: ${name}`, result.data);
      })
  );

  server.tool(
    "enable_passenger_app",
    "Enable/start a registered application",
    { name: z.string().describe("Application name") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("PassengerApps", "enable_application", { name });
        return formatSuccess(`Application enabled: ${name}`, result.data);
      })
  );

  server.tool(
    "disable_passenger_app",
    "Disable/stop a registered application",
    { name: z.string().describe("Application name") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("PassengerApps", "disable_application", { name });
        return formatSuccess(`Application disabled: ${name}`, result.data);
      })
  );

  server.tool(
    "ensure_passenger_deps",
    "Install/update dependencies for a registered application (npm install, pip install, etc.)",
    { name: z.string().describe("Application name") },
    async ({ name }) =>
      handleToolCall(async () => {
        const result = await client.uapi("PassengerApps", "ensure_deps", { name });
        return formatSuccess(`Dependencies installed for: ${name}`, result.data);
      })
  );
}
