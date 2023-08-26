import { createServer } from 'http';

import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { createRequestHandler } from '@remix-run/express';

import * as remixBuild from '../build/index.js';
import { type ServerBuild, broadcastDevReady } from '@remix-run/node';

const build = remixBuild as unknown as ServerBuild;

const app = express();

app.use(compression()); // compress static files

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Aggressively cache fonts for a year
app.use('/fonts', express.static('public/fonts', { immutable: true, maxAge: '1y' }));

app.use(morgan('tiny')); // logging

const httpServer = createServer(app);

app.all('*', createRequestHandler({ build, mode: process.env.NODE_ENV }));

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.info(`Running app in ${process.env.NODE_ENV} mode`);
  console.info(`Express server listening on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') broadcastDevReady(build);
});

// If you want to run the remix dev command with --no-restart, see https://github.com/remix-run/remix/blob/templates_v2_dev/templates/express
