#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CpanelClient } from "./cpanel-api.js";

import { registerFileTools } from "./tools/files.js";
import { registerDiskTools } from "./tools/disk.js";
import { registerMysqlTools } from "./tools/mysql.js";
import { registerEmailTools } from "./tools/email.js";
import { registerEmailAuthTools } from "./tools/email-auth.js";
import { registerEmailFilterTools } from "./tools/email-filters.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerDnssecTools } from "./tools/dnssec.js";
import { registerDomainTools } from "./tools/domains.js";
import { registerCronTools } from "./tools/cron.js";
import { registerPhpTools } from "./tools/php.js";
import { registerSslTools } from "./tools/ssl.js";
import { registerSecurityTools } from "./tools/security.js";
import { registerModSecurityTools } from "./tools/modsecurity.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerBackupTools } from "./tools/backups.js";
import { registerFtpTools } from "./tools/ftp.js";
import { registerPostgresqlTools } from "./tools/postgresql.js";
import { registerWordPressTools } from "./tools/wordpress.js";
import { registerPassengerTools } from "./tools/passenger.js";
import { registerVersionControlTools } from "./tools/version-control.js";
import { registerTwoFactorAuthTools } from "./tools/twofa.js";
import { registerVirusScannerTools } from "./tools/virus-scanner.js";
import { registerTokenTools } from "./tools/tokens.js";
import { registerFeatureTools } from "./tools/features.js";

async function main() {
  console.error("[Setup] Initializing cPanel MCP Server v2.0.0...");

  const cpanelClient = new CpanelClient();

  const server = new McpServer({
    name: "cpanel-mcp-server",
    version: "2.0.0",
  });

  console.error("[Setup] Registering tools...");

  // Core hosting
  registerFileTools(server, cpanelClient);
  registerDiskTools(server, cpanelClient);

  // Databases
  registerMysqlTools(server, cpanelClient);
  registerPostgresqlTools(server, cpanelClient);

  // Email
  registerEmailTools(server, cpanelClient);
  registerEmailAuthTools(server, cpanelClient);
  registerEmailFilterTools(server, cpanelClient);

  // DNS
  registerDnsTools(server, cpanelClient);
  registerDnssecTools(server, cpanelClient);

  // Domains
  registerDomainTools(server, cpanelClient);

  // Scheduling
  registerCronTools(server, cpanelClient);

  // PHP
  registerPhpTools(server, cpanelClient);

  // SSL/TLS
  registerSslTools(server, cpanelClient);

  // Security
  registerSecurityTools(server, cpanelClient);
  registerModSecurityTools(server, cpanelClient);
  registerTwoFactorAuthTools(server, cpanelClient);
  registerVirusScannerTools(server, cpanelClient);

  // Metrics & Logs
  registerMetricsTools(server, cpanelClient);

  // Backups
  registerBackupTools(server, cpanelClient);

  // FTP
  registerFtpTools(server, cpanelClient);

  // Applications & Deployment
  registerWordPressTools(server, cpanelClient);
  registerPassengerTools(server, cpanelClient);
  registerVersionControlTools(server, cpanelClient);

  // Account Management
  registerTokenTools(server, cpanelClient);
  registerFeatureTools(server, cpanelClient);

  console.error("[Setup] All tools registered. Starting transport...");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const shutdown = () => {
    console.error("[Shutdown] Cleaning up...");
    cpanelClient.destroy();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.error("[Setup] cPanel MCP Server running on stdio");
}

main().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
