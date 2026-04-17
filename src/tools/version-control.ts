import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validatePath } from "../validation.js";

export function registerVersionControlTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_git_repos",
    "List all Git repositories managed by cPanel",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("VersionControl", "retrieve");
        return formatData(result.data);
      })
  );

  server.tool(
    "create_git_repo",
    "Create a new Git repository in cPanel",
    {
      name: z.string().describe("Repository name"),
      repository_root: z.string().describe("Path for the repository (e.g., /home/user/repositories/myrepo)"),
      source_repository: z.string().optional().describe("URL of remote repository to clone from"),
    },
    async ({ name, repository_root, source_repository }) =>
      handleToolCall(async () => {
        validatePath(repository_root);
        const params: Record<string, string> = { name, repository_root, type: "git" };
        if (source_repository) params.source_repository = source_repository;
        const result = await client.uapi("VersionControl", "create", params);
        return formatSuccess(`Git repository created: ${name}`, result.data);
      })
  );

  server.tool(
    "delete_git_repo",
    "Delete a Git repository from cPanel",
    { repository_root: z.string().describe("Repository path to delete") },
    async ({ repository_root }) =>
      handleToolCall(async () => {
        validatePath(repository_root);
        const result = await client.uapi("VersionControl", "delete", { repository_root });
        return formatSuccess(`Git repository deleted: ${repository_root}`, result.data);
      })
  );

  server.tool(
    "update_git_repo",
    "Pull/update a Git repository",
    {
      repository_root: z.string().describe("Repository path"),
      branch: z.string().optional().describe("Branch to update"),
    },
    async ({ repository_root, branch }) =>
      handleToolCall(async () => {
        validatePath(repository_root);
        const params: Record<string, string> = { repository_root };
        if (branch) params.branch = branch;
        const result = await client.uapi("VersionControl", "update", params);
        return formatSuccess(`Git repository updated: ${repository_root}`, result.data);
      })
  );

  server.tool(
    "deploy_git_repo",
    "Deploy a Git repository (trigger deployment via .cpanel.yml)",
    { repository_root: z.string().describe("Repository path to deploy") },
    async ({ repository_root }) =>
      handleToolCall(async () => {
        validatePath(repository_root);
        const result = await client.uapi("VersionControlDeployment", "create", { repository_root });
        return formatSuccess(`Deployment triggered for: ${repository_root}`, result.data);
      })
  );

  server.tool(
    "get_git_deployment_status",
    "Get the deployment status of a Git repository",
    { repository_root: z.string().describe("Repository path") },
    async ({ repository_root }) =>
      handleToolCall(async () => {
        validatePath(repository_root);
        const result = await client.uapi("VersionControlDeployment", "retrieve", { repository_root });
        return formatData(result.data);
      })
  );
}
