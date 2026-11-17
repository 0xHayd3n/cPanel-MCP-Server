import test from "node:test";
import assert from "node:assert/strict";

import { registerPhpTools } from "../build/tools/php.js";

test("get_php_version_for_domain asks for the vhost's PHP version, not its handler", async () => {
  const handlers = new Map();
  const calls = [];
  const server = {
    tool(name, ...args) {
      handlers.set(name, args.at(-1));
    },
  };
  const client = {
    async uapi(...args) {
      calls.push(args);
      return { data: { vhost: "example.com", version: "ea-php83" } };
    },
  };
  registerPhpTools(server, client);

  const result = await handlers.get("get_php_version_for_domain")({ domain: "Example.COM" });

  assert.equal(result.isError, undefined);
  assert.deepEqual(calls, [["LangPHP", "php_get_vhost_versions", { vhost: "example.com" }]]);
  assert.match(result.content[0].text, /ea-php83/);

  const bad = await handlers.get("get_php_version_for_domain")({ domain: "not a domain!" });
  assert.equal(bad.isError, true);
  assert.equal(calls.length, 1);
});
