import { server } from './server';
import 'whatwg-fetch';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
