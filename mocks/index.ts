import { server } from 'mocks/mock-server';

server.listen({ onUnhandledRequest: 'bypass' });
console.info('🔶 Mock server running');

process.once('SIGINT', () => server.close());
process.once('SIGTERM', () => server.close());
