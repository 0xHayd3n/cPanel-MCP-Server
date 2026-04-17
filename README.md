# cPanel MCP Server

A comprehensive Model Context Protocol (MCP) server for managing cPanel hosting accounts through AI assistants. Connects directly to cPanel's UAPI, enabling natural language management of web hosting — DNS records, email accounts, databases, domains, SSL certificates, PHP versions, cron jobs, security settings, and more.

## Features

### File Management
- **List, create, read, edit, and delete files** in your hosting account

### Disk Usage
- **Account quota info** — check disk space consumption
- **Directory usage breakdown** — see what's using space

### MySQL Database Management
- **Full CRUD** for databases, users, and privileges
- **Server info** — version and restriction details
- **Privilege management** — grant/revoke per database

### PostgreSQL Database Management
- **Full CRUD** for databases, users, and privileges
- **Grant/revoke access** per database

### Email Management
- **Email accounts** — create, delete, change password, set quotas, list with disk usage
- **Forwarders** — create, list, and delete email forwarding rules
- **Autoresponders** — create, list, and delete out-of-office / autoresponse messages
- **Email routing** — view mail domain configuration

### DNS Management
- **List zones** and **parse zone records** for any domain
- **Add, edit, and delete** DNS records (A, AAAA, CNAME, MX, TXT, SRV, CAA)

### Domain Management
- **List all domains** — main, addon, subdomains, and parked
- **Addon domains** — create and delete
- **Subdomains** — create and delete with custom document roots
- **Parked domains (aliases)** — park and unpark
- **Redirects** — create and delete URL redirects (301/302)

### Cron Job Management
- **List, create, edit, and delete** cron jobs
- **Notification email** — get and set the cron notification address

### PHP Management
- **List installed PHP versions** available on the server
- **Get/set PHP version** per domain
- **PHP INI directives** — read and modify (memory_limit, upload_max_filesize, etc.)

### SSL/TLS Management
- **List certificates** and **SSL status** per domain
- **Install and delete** SSL certificates
- **Generate CSR** for certificate requests
- **AutoSSL** — check status and trigger renewal
- **List private keys**

### Security
- **IP Blocker** — list, block, and unblock IP addresses/ranges
- **SSH Keys** — list, import, delete, authorize, and deauthorize keys
- **Hotlink Protection** — get status, enable with custom settings, disable
- **Directory Privacy** — list protected directories and add users

### Metrics & Logs
- **Bandwidth usage** statistics
- **Resource usage** — CPU, memory, I/O, entry processes
- **Error logs** — recent error entries
- **Visitor stats** — per-domain access statistics
- **Account stats** — summary of email accounts, databases, domains, disk, bandwidth

### Backup Management
- **Full account backup** to home directory
- **Partial backups** — home directory, databases, and email separately
- **Restore** — database and file restore from backup
- **List available backups**

### FTP Management
- **List FTP accounts** with disk usage
- **Create and delete** FTP accounts
- **Change password and quota**
- **Active sessions** — list and terminate
- **Server port** info

### WordPress
- **List WordPress installations** (requires WP Toolkit / Instance Manager on server)

## Installation and Configuration

### Prerequisites
- Node.js 18+
- A cPanel account with API token access

### Build

```bash
npm install
npm run build
```

### Configure

Add the following to your MCP settings configuration (e.g., `claude_desktop_config.json`, `cline_mcp_settings.json`, or your IDE's MCP config):

```json
{
  "mcpServers": {
    "cpanel": {
      "command": "node",
      "args": ["/path/to/cPanel-MCP-Server/build/index.js"],
      "env": {
        "CPANEL_USERNAME": "your_cpanel_username",
        "CPANEL_API_TOKEN": "your_cpanel_api_token",
        "CPANEL_SERVER_URL": "https://your-domain.com:2083"
      }
    }
  }
}
```

Replace the placeholder values with your actual cPanel credentials.

### Getting a cPanel API Token

1. Log in to cPanel
2. Go to **Security** > **Manage API Tokens**
3. Create a new token with a descriptive name
4. Copy the token — it won't be shown again

## Available Tools (108 total)

| Category | Tools | Count |
|----------|-------|-------|
| File Management | `list_files`, `create_file`, `read_file`, `edit_file`, `delete_file` | 5 |
| Disk Usage | `get_disk_usage`, `get_directory_usage` | 2 |
| MySQL | `list_mysql_databases`, `create_mysql_database`, `delete_mysql_database`, `list_mysql_users`, `create_mysql_user`, `delete_mysql_user`, `set_mysql_privileges`, `revoke_mysql_privileges`, `get_mysql_server_info` | 9 |
| PostgreSQL | `list_postgresql_databases`, `create_postgresql_database`, `delete_postgresql_database`, `list_postgresql_users`, `create_postgresql_user`, `delete_postgresql_user`, `set_postgresql_privileges`, `revoke_postgresql_privileges` | 8 |
| Email | `list_email_accounts`, `create_email_account`, `delete_email_account`, `change_email_password`, `change_email_quota`, `list_email_forwarders`, `create_email_forwarder`, `delete_email_forwarder`, `list_autoresponders`, `create_autoresponder`, `delete_autoresponder`, `get_email_routing` | 12 |
| DNS | `list_dns_zones`, `get_dns_records`, `add_dns_record`, `edit_dns_record`, `delete_dns_record` | 5 |
| Domains | `list_domains`, `get_domain_info`, `list_subdomains`, `create_subdomain`, `delete_subdomain`, `list_addon_domains`, `create_addon_domain`, `delete_addon_domain`, `list_parked_domains`, `create_parked_domain`, `delete_parked_domain`, `list_redirects`, `create_redirect`, `delete_redirect` | 14 |
| Cron Jobs | `list_cron_jobs`, `create_cron_job`, `edit_cron_job`, `delete_cron_job`, `get_cron_email`, `set_cron_email` | 6 |
| PHP | `list_php_versions`, `get_php_version_for_domain`, `set_php_version_for_domain`, `get_php_ini_directives`, `set_php_ini_directives` | 5 |
| SSL/TLS | `list_ssl_certificates`, `get_ssl_status`, `install_ssl_certificate`, `delete_ssl_certificate`, `generate_ssl_csr`, `get_autossl_status`, `trigger_autossl`, `list_ssl_keys` | 8 |
| Security | `list_blocked_ips`, `block_ip`, `unblock_ip`, `list_ssh_keys`, `import_ssh_key`, `delete_ssh_key`, `authorize_ssh_key`, `deauthorize_ssh_key`, `get_hotlink_protection`, `enable_hotlink_protection`, `disable_hotlink_protection`, `list_directory_privacy`, `add_directory_user` | 13 |
| Metrics & Logs | `get_bandwidth_usage`, `get_resource_usage`, `get_error_log`, `get_visitors_stats`, `get_account_stats` | 5 |
| Backups | `create_full_backup`, `list_backups`, `create_database_backup`, `restore_database_backup`, `create_homedir_backup`, `restore_file_backup`, `create_email_backup` | 7 |
| FTP | `list_ftp_accounts`, `create_ftp_account`, `delete_ftp_account`, `change_ftp_password`, `change_ftp_quota`, `list_ftp_sessions`, `kill_ftp_session`, `get_ftp_port` | 8 |
| WordPress | `list_wordpress_installations` | 1 |

## Security

Your cPanel credentials are loaded from environment variables at runtime and are never stored in the repository. The API token should be treated as a secret — do not commit it to version control.

## License

ISC
