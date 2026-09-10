import test from "node:test";
import assert from "node:assert/strict";

import { CpanelApiError, CpanelClient } from "../build/cpanel-api.js";
import { registerDomainTools } from "../build/tools/domains.js";
import { registerFtpTools } from "../build/tools/ftp.js";
import { validatePath } from "../build/validation.js";

const ENV_KEYS = [
  "CPANEL_USERNAME",
  "CPANEL_API_TOKEN",
  "CPANEL_SERVER_URL",
  "CPANEL_ALLOW_INSECURE_HTTP",
];

function withCpanelEnv(serverUrl, allowInsecureHttp, fn) {
  const previous = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.CPANEL_USERNAME = "test-user";
  process.env.CPANEL_API_TOKEN = "test-token";
  process.env.CPANEL_SERVER_URL = serverUrl;
  if (allowInsecureHttp) {
    process.env.CPANEL_ALLOW_INSECURE_HTTP = "true";
  } else {
    delete process.env.CPANEL_ALLOW_INSECURE_HTTP;
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function constructClient(serverUrl, allowInsecureHttp = false) {
  return withCpanelEnv(serverUrl, allowInsecureHttp, () => {
    const client = new CpanelClient();
    client.destroy();
  });
}

test("accepts valid HTTPS URLs after WHATWG normalization", { concurrency: false }, () => {
  assert.doesNotThrow(() => constructClient("https://panel.example.test:2083"));
  assert.doesNotThrow(() => constructClient("HTTPS://PANEL.EXAMPLE.TEST:2083"));
});

test("requires explicit opt-in for loopback HTTP", { concurrency: false }, () => {
  assert.throws(
    () => constructClient("http://localhost:2083"),
    CpanelApiError
  );

  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    for (const serverUrl of [
      "http://localhost:2083",
      "http://127.0.0.1:2083",
      "http://127.255.255.255:2083",
      "http://[::1]:2083",
    ]) {
      assert.doesNotThrow(() => constructClient(serverUrl, true));
    }
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(warnings.length, 4);
});

test("rejects spoofed or remote HTTP hosts even with opt-in", { concurrency: false }, () => {
  for (const serverUrl of [
    "http://panel.example.test:2083",
    "http://localhost.evil.test:2083",
    "http://127.0.0.1.evil.test:2083",
    "http://localhost@attacker.example.test:2083",
    "http://127.0.0.1@attacker.example.test:2083",
  ]) {
    assert.throws(() => constructClient(serverUrl, true), CpanelApiError);
  }
});

test("rejects invalid schemes, URL credentials, queries, and fragments", { concurrency: false }, () => {
  for (const serverUrl of [
    "not a URL",
    "ftp://localhost:2083",
    "https://user:password@panel.example.test:2083",
    "https://panel.example.test:2083?token=secret",
    "https://panel.example.test:2083#fragment",
  ]) {
    assert.throws(() => constructClient(serverUrl), CpanelApiError);
  }
});

test("validatePath rejects raw and encoded traversal or null bytes", () => {
  for (const path of [
    "..",
    "../outside",
    "public_html/../private",
    "public_html\\..\\private",
    "public_html/\0private",
    "%2e%2e%2foutside",
    "public_html/%2e%2e/private",
    "public_html/%252e%252e%252fprivate",
    "public_html/%00private",
  ]) {
    assert.throws(() => validatePath(path), CpanelApiError, path);
  }
});

test("validatePath preserves ordinary and absolute cPanel paths", () => {
  for (const path of [
    "public_html/site",
    "/public_html/site",
    "/home/user/repositories/app",
    "100% complete",
    "folder/%20space",
  ]) {
    assert.equal(validatePath(path), path);
  }
});

function captureToolHandlers(register) {
  const handlers = new Map();
  const calls = [];
  const server = {
    tool(name, ...args) {
      handlers.set(name, args.at(-1));
    },
  };
  const client = {
    async api2(...args) {
      calls.push(["api2", ...args]);
      return [];
    },
    async uapi(...args) {
      calls.push(["uapi", ...args]);
      return { data: [] };
    },
  };

  register(server, client);
  return { calls, handlers };
}

test("domain and FTP tools reject encoded traversal before API calls", async () => {
  const domainHarness = captureToolHandlers(registerDomainTools);
  const ftpHarness = captureToolHandlers(registerFtpTools);

  const subdomainResult = await domainHarness.handlers.get("create_subdomain")({
    subdomain: "blog",
    domain: "example.com",
    document_root: "public_html/%2e%2e/private",
  });
  const addonResult = await domainHarness.handlers.get("create_addon_domain")({
    domain: "addon.example.com",
    subdomain: "addon",
    document_root: "public_html/%2e%2e/private",
  });
  const ftpResult = await ftpHarness.handlers.get("create_ftp_account")({
    user: "files",
    password: "test-password",
    quota: "0",
    homedir: "public_html/%2e%2e/private",
  });

  assert.equal(subdomainResult.isError, true);
  assert.equal(addonResult.isError, true);
  assert.equal(ftpResult.isError, true);
  assert.equal(domainHarness.calls.length, 0);
  assert.equal(ftpHarness.calls.length, 0);
});