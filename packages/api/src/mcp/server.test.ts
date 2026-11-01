import { describe, expect, test } from "bun:test";

import { bearerMcpToken } from "../lib/mcp-token";
import { authenticateMcpToken } from "../routers/admin-insights";
import { adminCaller, createTestDb } from "../test-db";
import { handleMcpRequest } from "./server";

async function setup(scope: "read" | "write") {
  const { db } = await createTestDb();
  const admin = await adminCaller(db);
  const { token } = await admin.adminMcp.create({ name: "Claude", scope });
  const deps = {
    readToken: (request: Request) =>
      bearerMcpToken(request.headers.get("authorization")) ?? new URL(request.url).searchParams.get("key"),
    authenticate: (raw: string) => authenticateMcpToken(db, raw),
    createCaller: (principal: { name: string }) => adminCaller(db, { actor: `mcp:${principal.name}` }),
  };
  const call = async (body: unknown, headers: Record<string, string> = { authorization: `Bearer ${token}` }) => {
    const response = await handleMcpRequest(
      new Request("https://delisert.test/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      }),
      deps,
    );
    return { status: response.status, body: response.status === 202 ? null : ((await response.json()) as any) };
  };
  return { db, admin, token, call, deps };
}

describe("mcp server", () => {
  test("rejects requests without a valid token", async () => {
    const { call } = await setup("read");
    const result = await call({ jsonrpc: "2.0", id: 1, method: "tools/list" }, {});
    expect(result.status).toBe(401);
  });

  test("initialize negotiates the protocol version and lists tools", async () => {
    const { call } = await setup("read");
    const init = await call({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } },
    });
    expect(init.body.result.protocolVersion).toBe("2025-03-26");
    expect(init.body.result.capabilities.tools).toBeDefined();

    expect((await call({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);

    const list = await call({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const names = list.body.result.tools.map((tool: { name: string }) => tool.name);
    expect(names).toContain("list_products");
    // Token baca tidak melihat alat ubah.
    expect(names).not.toContain("set_availability");
    const listProducts = list.body.result.tools.find((tool: { name: string }) => tool.name === "list_products");
    expect(listProducts.inputSchema.type).toBe("object");
  });

  test("read tools return catalogue data", async () => {
    const { call } = await setup("read");
    const result = await call({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "list_products", arguments: { search: "mochi" } },
    });
    const products = JSON.parse(result.body.result.content[0].text);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].name.toLowerCase()).toContain("mochi");
  });

  test("a read token cannot change anything", async () => {
    const { call, admin } = await setup("read");
    const [product] = await admin.adminProduct.list();
    const result = await call({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "set_availability", arguments: { id: product!.id, availability: "soldout" } },
    });
    expect(result.body.result.isError).toBe(true);
    expect((await admin.adminProduct.byId({ id: product!.id })).availability).toBe(product!.availability);
  });

  test("a write token changes data and the change is logged under the token name", async () => {
    const { call, admin } = await setup("write");
    const [product] = await admin.adminProduct.list();
    const result = await call(
      {
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: { name: "set_availability", arguments: { id: product!.id, availability: "soldout" } },
      },
    );
    expect(result.body.result.isError).toBeUndefined();
    expect((await admin.adminProduct.byId({ id: product!.id })).availability).toBe("soldout");
    expect((await admin.adminActivity.list({ limit: 1 }))[0]!.actor).toBe("mcp:Claude");
  });

  test("update_site_content changes only the given fields", async () => {
    const { call, admin } = await setup("write");
    await call({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "update_site_content", arguments: { section: "home", changes: { heroTitleLine1: "Halo," } } },
    });
    const content = await admin.adminSite.content();
    expect(content.home.heroTitleLine1).toBe("Halo,");
    expect(content.home.featuredEyebrow).toBe("Menu Andalan");
  });

  test("invalid arguments come back as a tool error, not a crash", async () => {
    const { call } = await setup("write");
    const result = await call({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name: "set_availability", arguments: { id: "x" } },
    });
    expect(result.body.result.isError).toBe(true);
    expect(result.body.result.content[0].text).toContain("Isian tidak valid");
  });

  test("the token can also be passed as ?key= for clients without custom headers", async () => {
    const { token, deps } = await setup("read");
    const response = await handleMcpRequest(
      new Request(`https://delisert.test/api/mcp?key=${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
      }),
      deps,
    );
    expect(response.status).toBe(200);
  });

  test("unknown methods and GET are refused", async () => {
    const { call, deps } = await setup("read");
    expect((await call({ jsonrpc: "2.0", id: 8, method: "resources/list" })).body.error.code).toBe(-32601);
    const get = await handleMcpRequest(new Request("https://delisert.test/api/mcp"), deps);
    expect(get.status).toBe(405);
  });
});
