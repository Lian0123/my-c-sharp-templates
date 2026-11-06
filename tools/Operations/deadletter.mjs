import { fileURLToPath } from 'node:url';
export async function operate(channel, action, service, take, output = console.log) {
  if (!['list', 'replay'].includes(action) || !['account', 'message'].includes(service) || !Number.isInteger(take) || take < 1 || take > 100)
    throw new Error('Usage: list|replay account|message [1..100]');
  const queue = `${service}.events.v1`; await channel.checkQueue(queue + '.dead');
  let last; let count = 0;
  try {
    for (; count < take; count++) {
      const message = await channel.get(queue + '.dead', { noAck: false }); if (!message) break;
      last = message;
      let envelope = {};
      try { envelope = JSON.parse(message.content.toString('utf8')) ?? {}; } catch { /* Preview malformed envelopes without dumping their contents. */ }
      output(JSON.stringify({ messageId: message.properties.messageId, eventType: envelope.type ?? 'invalid-envelope',
        schemaVersion: envelope.schemaVersion, attempt: message.properties.headers?.['x-attempt'] ?? 0, action }));
      if (action === 'replay') {
        let returned = false; const onReturn = () => { returned = true; }; channel.on('return', onReturn);
        try {
          const headers = { ...message.properties.headers, 'x-attempt': 0 }; delete headers['x-failure-type']; delete headers['x-delivery-count'];
          channel.publish(queue + '.delivery', queue, message.content, { ...message.properties, headers, persistent: true, mandatory: true });
          await channel.waitForConfirms();
          if (returned) throw new Error('Replay was unroutable; original message remains unacknowledged');
          channel.ack(message); last = undefined;
        } finally { channel.removeListener('return', onReturn); }
      }
    }
  } finally {
    // Preview is non-destructive. Failed replay is requeued; a process crash has the same effect.
    if (last) channel.nack(last, action === 'list', true);
  }
  return count;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let connection;
  try {
    if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is required');
    const { default: amqp } = await import('amqplib'); connection = await amqp.connect(process.env.RABBITMQ_URL);
    connection.on('error', () => {});
    const channel = await connection.createConfirmChannel();
    channel.on('error', () => {});
    const count = await operate(channel, process.argv[2], process.argv[3], Number(process.argv[4] ?? 10));
    console.log(JSON.stringify({ processed: count })); await channel.close();
  } catch (error) {
    const message = String(error.message).replace(/amqps?:\/\/[^@]+@/g, 'amqp://[REDACTED]@'); console.error(message); process.exitCode = 1;
  } finally { if (connection) await connection.close(); }
}
