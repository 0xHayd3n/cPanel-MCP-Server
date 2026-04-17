# cPanel MCP Server

A comprehensive Model Context Protocol (MCP) server for managing cPanel hosting accounts through AI assistants. Connects directly to cPanel's UAPI and API2, enabling natural language management of web hosting — DNS, DNSSEC, email (with DKIM/SPF), databases, domains, SSL/AutoSSL, PHP, cron jobs, security (WAF, IP blocker, virus scanner, 2FA), Git deployment, Node.js/Python apps, and more.

## Features

### File Management
- **List, create, read, edit, and delete files** in your hosting account

### Disk Usage
- **Account quota info** — check disk space consumption and limits

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

### Email Authentication (DKIM/SPF)
- **DKIM** — enable, disable, validate, and ensure keys exist for all domains
- **SPF** — validate and install/update SPF records
- **PTR** — validate reverse DNS records

### Email Filters & Spam
- **Email filters** — list, delete, and trace/test filters
- **SpamAssassin** — enable/disable, configure spam box, get settings, clear spam
- **Greylisting** — enable/disable for all domains

### DNS Management
- **Get zone records** for any domain (via API2 ZoneEdit)
- **Add, edit, and delete** DNS records (A, AAAA, CNAME, MX, TXT, SRV, CAA)

### DNSSEC
- **Enable/disable** DNSSEC for domains
- **DS records** — fetch for registrar configuration
- **DNSKEY export** — export zone keys
- **NSEC3** — enable/disable (prevents zone enumeration)

### Domain Management
- **List all domains** — main, addon, subdomains, and parked
- **Addon domains** — create and delete
- **Subdomains** — create and delete with custom document roots
- **Parked domains (aliases)** — park and unpark
- **Redirects** — create and delete URL redirects (301/302)

### Cron Job Management
- **List, create, edit, and delete** cron jobs (via API2)
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

### ModSecurity (WAF)
- **Status** — check if ModSecurity is installed, list domain status
- **Enable/disable** globally or per domain

### Two-Factor Authentication
- **Status** — check if 2FA is configured
- **Setup** — generate secret/QR code, enable with verification
- **Remove** — disable 2FA

### Virus Scanner (ClamAV)
- **Scan** — start virus scan on a directory
- **Status** — check scan progress
- **Results** — list infected files, quarantine/disinfect

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

### Applications & Deployment
- **WordPress** — list installations (requires WP Toolkit / Instance Manager)
- **Node.js/Python/Ruby apps** — register, unregister, enable, disable, install dependencies (Phusion Passenger)
- **Git repositories** — create, list, update, delete, and deploy via `.cpanel.yml`

### Account Management
- **API tokens** — list, create, rename, and revoke
- **Features** — list available features, check if specific features are enabled
- **Account info** — user information, server details

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

## Available Tools (164 total)

| Category | Count |
|----------|-------|
| File Management | 5 |
| Disk Usage | 1 |
| MySQL | 9 |
| PostgreSQL | 8 |
| Email (accounts, forwarders, autoresponders) | 12 |
| Email Authentication (DKIM/SPF/PTR) | 7 |
| Email Filters & Spam | 12 |
| DNS | 4 |
| DNSSEC | 6 |
| Domains (addon, sub, parked, redirects) | 14 |
| Cron Jobs | 6 |
| PHP | 5 |
| SSL/TLS & AutoSSL | 8 |
| Security (IP blocker, SSH, hotlink, privacy) | 13 |
| ModSecurity (WAF) | 5 |
| Two-Factor Auth | 4 |
| Virus Scanner (ClamAV) | 4 |
| Metrics & Logs | 5 |
| Backups | 7 |
| FTP | 8 |
| WordPress | 1 |
| Passenger Apps (Node.js/Python/Ruby) | 6 |
| Git Version Control & Deployment | 6 |
| API Tokens | 4 |
| Account & Server Info | 4 |

## Architecture

```
src/
├── index.ts           # MCP server entry point — registers all 25 tool modules
├── cpanel-api.ts      # cPanel API client (UAPI + API2, token auth, error handling)
└── tools/
    ├── files.ts           # File operations (Fileman)
    ├── disk.ts            # Disk usage (Quota, DiskUsage)
    ├── mysql.ts           # MySQL databases (Mysql)
    ├── postgresql.ts      # PostgreSQL databases (Postgresql)
    ├── email.ts           # Email accounts, forwarders, autoresponders (Email)
    ├── email-auth.ts      # DKIM, SPF, PTR validation (EmailAuth)
    ├── email-filters.ts   # Filters, SpamAssassin, Greylisting
    ├── dns.ts             # DNS zone records (DNS)
    ├── dnssec.ts          # DNSSEC management (DNSSEC)
    ├── domains.ts         # Domains, subdomains, redirects
    ├── cron.ts            # Cron jobs (API2 Cron)
    ├── php.ts             # PHP version & INI (LangPHP)
    ├── ssl.ts             # SSL/TLS & AutoSSL (SSL)
    ├── security.ts        # IP blocker, SSH, hotlink, privacy
    ├── modsecurity.ts     # ModSecurity WAF
    ├── twofa.ts           # Two-factor authentication
    ├── virus-scanner.ts   # ClamAV virus scanner
    ├── metrics.ts         # Bandwidth, resources, logs, stats
    ├── backups.ts         # Full & partial backups, restore
    ├── ftp.ts             # FTP accounts & sessions
    ├── wordpress.ts       # WordPress installations
    ├── passenger.ts       # Node.js/Python/Ruby apps
    ├── version-control.ts # Git repos & deployment
    ├── tokens.ts          # API token management
    └── features.ts        # Feature checks & server info
```

## API Compatibility

- **UAPI** (preferred) — used for most modules
- **API2** (legacy) — used where cPanel has no UAPI equivalent:
  - **Cron jobs** — `Cron::fetchcron`, `add_line`, `edit_line`, `remove_line`, `get_email`, `set_email`
  - **DNS records** — `ZoneEdit::fetchzone_records`, `add_zone_record`, `edit_zone_record`, `remove_zone_record`
  - **Subdomains** — `SubDomain::listsubdomains`, `addsubdomain`, `delsubdomain`
  - **Addon domains** — `AddonDomain::listaddondomains`, `addaddondomain`, `deladdondomain`
  - **Parked domains** — `Park::listparkeddomains`, `park`, `unpark`
  - **IP blocking list** — `DenyIp::listdenyips`
- Both API versions share the same authenticated client with retry logic and error handling

## Security

Your cPanel credentials are loaded from environment variables at runtime and are never stored in the repository. The API token should be treated as a secret — do not commit it to version control.

## License

ISC
