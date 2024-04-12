import { execSync } from "node:child_process";

import * as matchers from "@testing-library/jest-dom/matchers";
import { beforeEach, expect } from "vitest";
expect.extend(matchers);

process.env.DATABASE_URL = `${process.env.DATABASE_URL}-test-${process.env.VITEST_POOL_ID}`;

beforeEach(() => {
  execSync("npx prisma migrate reset --force --skip-seed");
});
