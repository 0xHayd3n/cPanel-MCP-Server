import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CpanelApiError, CpanelClient } from "../cpanel-api.js";
import { handleToolCall, formatData, formatSuccess } from "../tool-helpers.js";
import { validateDomain } from "../validation.js";


// LangPHP's php.ini functions need to know which php.ini they act on: the account's
// "home" php.ini, or the php.ini of one virtual host. cPanel rejects a call without `type`
// ("Provide the "type" argument") and, for type "vhost", without `vhost`.
const iniTypeSchema = z
  .enum(["home", "vhost"])
  .optional()
  .describe('Which php.ini to use: "home" (the account) or "vhost" (one domain). Defaults to "vhost" when vhost is given, otherwise "home".');
const iniVhostSchema = z
  .string()
  .optional()
  .describe('Domain whose php.ini to use. Required for type "vhost".');

export function resolveIniScope(
  type: "home" | "vhost" | undefined,
  vhost: string | undefined
): Record<string, string> {
  const resolved = type ?? (vhost ? "vhost" : "home");
  if (resolved === "vhost") {
    if (!vhost) {
      throw new CpanelApiError('vhost is required when type is "vhost"');
    }
    return { type: "vhost", vhost: validateDomain(vhost) };
  }
  if (vhost) {
    throw new CpanelApiError('vhost can only be used with type "vhost"');
  }
  return { type: "home" };
}

const DIRECTIVE_KEY_RE = /^[A-Za-z][A-Za-z0-9_.]*$/;
const MAX_DIRECTIVES = 50;

export function buildDirectiveParams(
  directives: Record<string, string>
): Record<string, string> {
  const entries = Object.entries(directives);
  if (entries.length === 0) {
    throw new CpanelApiError("At least one directive is required");
  }
  if (entries.length > MAX_DIRECTIVES) {
    throw new CpanelApiError(`At most ${MAX_DIRECTIVES} directives can be set at once`);
  }
  const params: Record<string, string> = {};
  entries.forEach(([key, value], index) => {
    if (!DIRECTIVE_KEY_RE.test(key)) {
      throw new CpanelApiError(`Invalid PHP directive name: ${key}`);
    }
    if (/[\r\n\0]/.test(value)) {
      throw new CpanelApiError(`Invalid value for ${key}: line breaks are not allowed`);
    }
    params[`directive-${index + 1}`] = `${key}:${value}`;
  });
  return params;
}

export function registerPhpTools(server: McpServer, client: CpanelClient) {
  server.tool(
    "list_php_versions",
    "List all installed PHP versions available on the server",
    {},
    async () =>
      handleToolCall(async () => {
        const result = await client.uapi("LangPHP", "php_get_installed_versions");
        return formatData(result.data);
      })
  );

  server.tool(
    "get_php_version_for_domain",
    "Get the current PHP version assigned to a domain",
    { domain: z.string().describe("Domain name to check") },
    async ({ domain }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("LangPHP", "php_get_domain_handler", {
          type: "home",
          vhost: d,
        });
        return formatData(result.data);
      })
  );

  server.tool(
    "set_php_version_for_domain",
    "Set the PHP version for a domain",
    {
      domain: z.string().describe("Domain name"),
      version: z.string().describe("PHP version (e.g., 'ea-php81', 'ea-php82', 'ea-php83')"),
    },
    async ({ domain, version }) =>
      handleToolCall(async () => {
        const d = validateDomain(domain);
        const result = await client.uapi("LangPHP", "php_set_domain_handler", {
          type: "home",
          vhost: d,
          php_version: version,
        });
        return formatSuccess(`PHP version for ${d} set to ${version}`, result.data);
      })
  );

  server.tool(
    "get_php_ini_directives",
    "Get PHP INI directives of the account (type home) or of one domain (type vhost). Returns the basic directives with their values and defaults; set raw to true to get the php.ini file content instead.",
    {
      type: iniTypeSchema,
      vhost: iniVhostSchema,
      raw: z
        .boolean()
        .optional()
        .describe("Return the raw php.ini content instead of the structured basic directives"),
    },
    async ({ type, vhost, raw }) =>
      handleToolCall(async () => {
        const scope = resolveIniScope(type, vhost);
        const func = raw ? "php_ini_get_user_content" : "php_ini_get_user_basic_directives";
        const result = await client.uapi("LangPHP", func, scope);
        return formatData(result.data);
      })
  );

  server.tool(
    "set_php_ini_basic_directives",
    "Set one or more PHP INI directives (e.g. memory_limit, upload_max_filesize) for the account (type home) or one domain (type vhost), using the same function as cPanel's MultiPHP INI Editor Basic Mode.",
    {
      directives: z
        .record(z.string(), z.string())
        .describe('Directive names and values, e.g. {"upload_max_filesize": "8M", "memory_limit": "256M"}'),
      type: iniTypeSchema,
      vhost: iniVhostSchema,
    },
    async ({ directives, type, vhost }) =>
      handleToolCall(async () => {
        const scope = resolveIniScope(type, vhost);
        const params = { ...scope, ...buildDirectiveParams(directives) };
        const result = await client.uapi("LangPHP", "php_ini_set_user_basic_directives", params);
        return formatSuccess("PHP INI directives updated", result.data);
      })
  );

  server.tool(
    "set_php_ini_directives",
    "Write the content of a php.ini file (type home, or type vhost for one domain). The content is the whole file as given: read the current content first with get_php_ini_directives (raw true) and send it back with your changes. To change single directives use set_php_ini_basic_directives instead.",
    {
      content: z.string().describe("PHP INI content (e.g., 'memory_limit = 256M\\nupload_max_filesize = 64M')"),
      type: iniTypeSchema,
      vhost: iniVhostSchema,
    },
    async ({ content, type, vhost }) =>
      handleToolCall(async () => {
        const scope = resolveIniScope(type, vhost);
        const result = await client.uapi("LangPHP", "php_ini_set_user_content", { ...scope, content });
        return formatSuccess("PHP INI directives updated", result.data);
      })
  );
}
