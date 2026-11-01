import { describe, expect, test, afterEach } from "bun:test";
import { deletePhoto, publicPhotoUrl, uploadPhoto } from "./storage";

const CONFIG = {
  url: "https://abc123.supabase.co",
  serviceRoleKey: "service-role-key",
  bucket: "products",
};

const originalFetch = globalThis.fetch;

function mockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  globalThis.fetch = handler as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("publicPhotoUrl", () => {
  test("builds the public object URL", () => {
    expect(publicPhotoUrl(CONFIG, "abc.jpg")).toBe(
      "https://abc123.supabase.co/storage/v1/object/public/products/abc.jpg",
    );
  });

  test("does not double the slash when the project URL ends with one", () => {
    expect(publicPhotoUrl({ ...CONFIG, url: "https://abc123.supabase.co/" }, "abc.jpg")).toBe(
      "https://abc123.supabase.co/storage/v1/object/public/products/abc.jpg",
    );
  });
});

describe("uploadPhoto", () => {
  test("posts the object with the service role key", async () => {
    let captured: { url: string; init?: RequestInit } | undefined;
    mockFetch(async (input, init) => {
      captured = { url: String(input), init };
      return new Response(JSON.stringify({ Key: "products/abc.jpg" }), { status: 200 });
    });

    const result = await uploadPhoto(CONFIG, "abc.jpg", new Uint8Array([1, 2, 3]).buffer, "image/jpeg");

    expect(result).toEqual({ ok: true });
    expect(captured?.url).toBe("https://abc123.supabase.co/storage/v1/object/products/abc.jpg");
    const headers = captured?.init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer service-role-key");
    expect(headers.apikey).toBe("service-role-key");
    expect(headers["content-type"]).toBe("image/jpeg");
  });

  test("reports a storage error instead of throwing", async () => {
    mockFetch(async () => new Response("nope", { status: 400 }));

    const result = await uploadPhoto(CONFIG, "abc.jpg", new Uint8Array([1]).buffer, "image/jpeg");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("Gagal mengunggah");
  });

  test("reports a network failure instead of throwing", async () => {
    mockFetch(async () => {
      throw new Error("network down");
    });

    const result = await uploadPhoto(CONFIG, "abc.jpg", new Uint8Array([1]).buffer, "image/jpeg");

    expect(result.ok).toBe(false);
  });
});

describe("deletePhoto", () => {
  test("deletes the object", async () => {
    let captured: string | undefined;
    mockFetch(async (input) => {
      captured = String(input);
      return new Response(null, { status: 200 });
    });

    const result = await deletePhoto(CONFIG, "abc.jpg");

    expect(result.ok).toBe(true);
    expect(captured).toBe("https://abc123.supabase.co/storage/v1/object/products/abc.jpg");
  });

  test("treats a missing object as already gone", async () => {
    mockFetch(async () => new Response("not found", { status: 404 }));
    expect(await deletePhoto(CONFIG, "abc.jpg")).toEqual({ ok: true });
  });
});
