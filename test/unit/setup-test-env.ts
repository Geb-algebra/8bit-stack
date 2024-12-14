import "./db-setup.ts";
// we need these to be imported first 👆

import { cleanup, configure } from "@testing-library/react";
import { server } from "mocks/mock-server.ts";

configure({ asyncUtilTimeout: 500 });

beforeAll(async () => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterEach(async () => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
