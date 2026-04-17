#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CpanelClient, CpanelApiError } from "./cpanel-api.js";

import { registerFileTools } from "./tools/files.js";
import { registerDiskTools } from "./tools/disk.js";
import { registerMysqlTools } from "./tools/mysql.js";
import { registerEmailTools } from "./tools/email.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerDomainTools } from "./tools/domains.js";
import { registerCronTools } from "./tools/cron.js";
import { registerPhpTools } from "./tools/php.js";
import { registerSslTools } from "./tools/ssl.js";
import { registerSecurityTools } from "./tools/security.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerBackupTools } from "./tools/backups.js";
import { registerFtpTools } from "./tools/ftp.js";
import { registerPostgresqlTools } from "./tools/postgresql.js";
import { registerWordPressTools } from "./tools/wordpress.js";

async function main() {
  console.error("[Setup] Initializing cPanel MCP Server v2.0.0...");

  const cpanelClient = new CpanelClient();

  const server = new McpServer({
    name: "cpanel-mcp-server",
    version: "2.0.0",
  });

  console.error("[Setup] Registering tools...");

  registerFileTools(server, cpanelClient);
  registerDiskTools(server, cpanelClient);
  registerMysqlTools(server, cpanelClient);
  registerEmailTools(server, cpanelClient);
  registerDnsTools(server, cpanelClient);
  registerDomainTools(server, cpanelClient);
  registerCronTools(server, cpanelClient);
  registerPhpTools(server, cpanelClient);
  registerSslTools(server, cpanelClient);
  registerSecurityTools(server, cpanelClient);
  registerMetricsTools(server, cpanelClient);
  registerBackupTools(server, cpanelClient);
  registerFtpTools(server, cpanelClient);
  registerPostgresqlTools(server, cpanelClient);
  registerWordPressTools(server, cpanelClient);

  console.error("[Setup] All tools registered. Starting transport...");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[Setup] cPanel MCP Server running on stdio");
}

main().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
