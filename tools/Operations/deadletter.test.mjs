import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { operate } from './deadletter.mjs';
function channel(messages) {
  const events = []; const client = new EventEmitter();
  Object.assign(client, { checkQueue: async () => {}, get: async () => messages.shift() ?? false,
    publish: (...args) => { events.push(['publish', ...args]); }, waitForConfirms: async () => { events.push(['confirmed']); },
    ack: message => events.push(['ack', message]), nack: (...args) => events.push(['nack', ...args]), events }); return client;
}
const item = (value = { type: 'profile.changed', schemaVersion: 1 }) => ({ content: Buffer.from(JSON.stringify(value)), properties: { messageId: 'event-id', headers: { 'x-attempt': 5, 'x-failure-type': 'TestFailure' } } });
test('preview requeues all fetched messages and never publishes or acknowledges', async () => {
  const first = item(); const last = item(); const client = channel([first, last]); const output = [];
  assert.equal(await operate(client, 'list', 'message', 10, line => output.push(line)), 2);
  assert.deepEqual(client.events, [['nack', last, true, true]]); assert.equal(output.length, 2); assert.equal(JSON.parse(output[0]).attempt, 5);
});
test('replay confirms durable publication before acknowledging the original', async () => {
  const message = item(); const client = channel([message]); await operate(client, 'replay', 'account', 1, () => {});
  assert.deepEqual(client.events.map(x => x[0]), ['publish', 'confirmed', 'ack']);
  assert.equal(client.events[0][4].headers['x-attempt'], 0); assert.equal(client.events[0][4].headers['x-failure-type'], undefined);
  assert.equal(client.events[0][4].mandatory, true); assert.equal(client.events[0][4].persistent, true);
});
test('negative confirms and unroutable replay preserve the original message', async () => {
  for (const mode of ['confirm', 'return']) {
    const message = item(); const client = channel([message]);
    if (mode === 'confirm') client.waitForConfirms = async () => { throw new Error('not confirmed'); };
    else client.publish = () => client.emit('return', message);
    await assert.rejects(operate(client, 'replay', 'message', 1, () => {}));
    assert.equal(client.events.at(-1)[0], 'nack'); assert.equal(client.events.some(x => x[0] === 'ack'), false);
  }
});
test('malformed envelopes are previewed without outputting raw contents', async () => {
  const message = item(); message.content = Buffer.from('not-json'); message.properties.headers = undefined;
  const lines = []; await operate(channel([message]), 'list', 'message', 1, x => lines.push(x));
  assert.equal(JSON.parse(lines[0]).eventType, 'invalid-envelope'); assert.equal(JSON.parse(lines[0]).attempt, 0);
});
test('input validation and empty queues are explicit', async () => {
  for (const args of [['bad', 'message', 1], ['list', 'auth', 1], ['list', 'message', 0], ['list', 'message', 101], ['list', 'message', 1.5]]) await assert.rejects(operate(channel([]), ...args));
  assert.equal(await operate(channel([]), 'list', 'message', 10), 0);
});
