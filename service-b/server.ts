import amqp from 'amqplib';
import { db } from '../sqlite-db';
type Message = {
  trackingId: string;
  service: string;
  payload: string;
  timestamp: number;
  text: string
};
/**
 * Este script consume mensajes de la cola principal y los procesa.
 * Si el mensaje contiene la palabra "error", se guarda en la base de datos y se elimina de la cola principal.
 * Si el mensaje no contiene la palabra "error", se procesa correctamente.
 * manejo de mensajes en cola principal y DLQ(Dead Letter Queue).
 */
async function consumeMessages(): Promise<void> {
  try {
    const connection: amqp.Connection = await amqp.connect('amqp://localhost');
    const channel: amqp.Channel = await connection.createChannel();

    const mainQueue = 'main_queue';
    const dlqQueue = 'dlq_queue';

    // Configurar DLQ
    await channel.assertQueue(dlqQueue, {
      durable: true,
    });

    // Configurar main_queue con DLQ
    await channel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '', // Usamos el intercambio por defecto
        'x-dead-letter-routing-key': dlqQueue,
      },
    });

    console.log('Esperando mensajes en', mainQueue);

    channel.consume(mainQueue, async (msg: any) => {

      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString()) as Message;
        console.log('Mensaje recibido:', messageContent);


        const shouldFail: boolean = messageContent.text.toLowerCase().includes("error")
        if (shouldFail) {
          saveErrorOnDB(messageContent) // INFO: Se guarda el mensaje en la base de datos
          channel.ack(msg); //INFO: Se elimina el mensaje de la cola principal

        } else {
          console.log('Mensaje procesado correctamente');
        }
      }
    });
  } catch (error) {
    console.error('Error consumiendo mensajes:', error);
  }
}
function saveErrorOnDB({ trackingId, timestamp, service, payload }: Message): void {
  db.run(
    `INSERT INTO error_logs (uuid, timestamp, service_name, original_payload, error_message) VALUES (?, ?, ?, ?, ?)`,
    [trackingId, timestamp, service, JSON.stringify(payload), 'Error procesando mensaje en DLQ'],
    (err: unknown) => {
      if (err instanceof Error) {
        console.error('Error al insertar en la base de datos:', err.message);
      } else {
        console.log('Error registrado correctamente.');
      }
    }
  );
}
consumeMessages();

