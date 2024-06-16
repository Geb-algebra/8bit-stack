import { installGlobals } from "@remix-run/node";
import { server } from "mocks/mock-server.ts";
import { resetDB } from "test/utils.ts";
import { beforeEach } from "vitest";

installGlobals();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

beforeEach(async () => {
  await resetDB();
  server.resetHandlers();
});

afterAll(() => server.close());
