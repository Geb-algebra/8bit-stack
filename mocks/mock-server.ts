import { http, passthrough } from "msw";
import { setupServer } from "msw/node";
export const server = setupServer(
  http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, (req) => passthrough()),
);
