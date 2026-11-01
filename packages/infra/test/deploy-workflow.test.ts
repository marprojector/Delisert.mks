import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../../..");
const workflowPath = join(root, ".github/workflows/deploy.yml");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("automatic Cloudflare deploy", () => {
  test("a workflow deploys every push to main", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const workflow = readFileSync(workflowPath, "utf8");
    expect(workflow).toMatch(/push:\s*\n\s*branches:\s*\[main\]/);
    expect(workflow).not.toContain("pull_request");
  });

  test("it deploys the production stage with credentials from GitHub secrets only", () => {
    const workflow = readFileSync(workflowPath, "utf8");
    expect(workflow).toContain("--stage production");
    for (const name of ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]) {
      expect(workflow).toContain(`${name}: \${{ secrets.${name} }}`);
    }
  });

  test("two deploys never run at the same time", () => {
    expect(readFileSync(workflowPath, "utf8")).toMatch(/concurrency:[\s\S]*cancel-in-progress: false/);
  });

  test("deploy state lives in Cloudflare, not on the CI runner's throwaway disk", () => {
    const infra = read("packages/infra/alchemy.run.ts");
    expect(infra).toContain("state: Cloudflare.state()");
    expect(infra).not.toContain("localState");
  });

  test("no Supabase configuration is left anywhere", () => {
    for (const path of ["packages/infra/.env.schema", "packages/infra/alchemy.run.ts", "README.md", ".github/workflows/deploy.yml"]) {
      expect({ path, supabase: /supabase/i.test(read(path)) }).toEqual({ path, supabase: false });
    }
  });
});
