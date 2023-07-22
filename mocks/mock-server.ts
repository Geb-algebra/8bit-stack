import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, (req) => req.passthrough()),
);
