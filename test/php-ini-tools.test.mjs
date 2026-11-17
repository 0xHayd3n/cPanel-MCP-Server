import test from "node:test";
import assert from "node:assert/strict";

import { registerPhpTools } from "../build/tools/php.js";

function harness() {
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
      return { data: { ok: true } };
    },
  };
  registerPhpTools(server, client);
  return { handlers, calls };
}

test("get_php_ini_directives defaults to the home php.ini", async () => {
  const { handlers, calls } = harness();
  const result = await handlers.get("get_php_ini_directives")({});
  assert.equal(result.isError, undefined);
  assert.deepEqual(calls, [["LangPHP", "php_ini_get_user_basic_directives", { type: "home" }]]);
});

test("get_php_ini_directives uses vhost when a domain is given", async () => {
  const { handlers, calls } = harness();
  await handlers.get("get_php_ini_directives")({ vhost: "Example.COM" });
  assert.deepEqual(calls, [
    ["LangPHP", "php_ini_get_user_basic_directives", { type: "vhost", vhost: "example.com" }],
  ]);
});

test("get_php_ini_directives raw returns the php.ini content function", async () => {
  const { handlers, calls } = harness();
  await handlers.get("get_php_ini_directives")({ type: "vhost", vhost: "example.com", raw: true });
  assert.deepEqual(calls, [
    ["LangPHP", "php_ini_get_user_content", { type: "vhost", vhost: "example.com" }],
  ]);
});

test("php.ini tools reject inconsistent scope before calling the API", async () => {
  const { handlers, calls } = harness();
  const missingVhost = await handlers.get("get_php_ini_directives")({ type: "vhost" });
  const homeWithVhost = await handlers.get("get_php_ini_directives")({ type: "home", vhost: "example.com" });
  const badDomain = await handlers.get("set_php_ini_basic_directives")({
    directives: { memory_limit: "256M" },
    vhost: "not a domain!",
  });
  assert.equal(missingVhost.isError, true);
  assert.equal(homeWithVhost.isError, true);
  assert.equal(badDomain.isError, true);
  assert.equal(calls.length, 0);
});

test("set_php_ini_basic_directives numbers the directives as name:value", async () => {
  const { handlers, calls } = harness();
  const result = await handlers.get("set_php_ini_basic_directives")({
    directives: { upload_max_filesize: "8M", "session.gc_maxlifetime": "300" },
    vhost: "example.com",
  });
  assert.equal(result.isError, undefined);
  assert.deepEqual(calls, [
    [
      "LangPHP",
      "php_ini_set_user_basic_directives",
      {
        type: "vhost",
        vhost: "example.com",
        "directive-1": "upload_max_filesize:8M",
        "directive-2": "session.gc_maxlifetime:300",
      },
    ],
  ]);
});

test("set_php_ini_basic_directives rejects bad names, values and sizes", async () => {
  const { handlers, calls } = harness();
  const tooMany = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`d${i}`, "1"]));
  for (const directives of [
    {},
    { "bad name": "1" },
    { "memory_limit:x": "1" },
    { "1memory": "1" },
    { memory_limit: "256M\nallow_url_include = On" },
    { memory_limit: "256M\r" },
    tooMany,
  ]) {
    const result = await handlers.get("set_php_ini_basic_directives")({ directives });
    assert.equal(result.isError, true, JSON.stringify(directives).slice(0, 60));
  }
  assert.equal(calls.length, 0);
});

test("set_php_ini_directives sends the scope together with the content", async () => {
  const { handlers, calls } = harness();
  await handlers.get("set_php_ini_directives")({ content: "memory_limit = 256M\n", type: "home" });
  assert.deepEqual(calls, [
    ["LangPHP", "php_ini_set_user_content", { type: "home", content: "memory_limit = 256M\n" }],
  ]);
});
