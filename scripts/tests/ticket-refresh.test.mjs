import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const values = new Map();
const events = [];

beforeEach(() => {
  values.clear();
  events.length = 0;
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  globalThis.CustomEvent = globalThis.CustomEvent || class CustomEvent extends Event {
    constructor(type, options = {}) { super(type); this.detail = options.detail; }
  };
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: event => { events.push(event); return true; }
  };
});

test('submitting a ticket notifies the same page to refresh the application list', async () => {
  const { addSharedTicket } = await import('../../src/utils/sharedSession.js');
  const ticket = addSharedTicket({
    id: 'REV-TRF-1234',
    sourceCode: 'TRF',
    cardNo: 'RC-10029381',
    source: '申请代理转移'
  }, 'zh');

  const refresh = events.find(event => event.type === 'rcm-ticket-added');
  assert.ok(refresh, 'same-page refresh event must be dispatched');
  assert.equal(refresh.detail.id, ticket.id);
  assert.equal(refresh.detail.sourceCode, 'TRF');
  assert.equal(refresh.detail.cardNo, 'RC-10029381');
  assert.ok(values.has('rcm_shared_tickets_zh'), 'ticket must still be persisted for the active language');
});
