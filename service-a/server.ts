import * as amqp from 'amqplib';
import { randomUUID } from 'crypto'
type Message = {
  trackingId: string;
  service: string;
  payload: string;
  timestamp: string;
  text: string;
};


/**
  * Este script envía mensajes a la cola principal.
  * Se envía un mensaje con un objeto de prueba.
  * INFO: para pruebas de error, se envía un mensaje con un objeto de prueba que contiene la palabra "error".
  *
  */
async function sendMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const mainQueue = 'main_queue';
    const dlqQueue = 'dlq_queue';

    await channel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': dlqQueue,
      }

    });

    // const message = { text: 'Hola desde Microservicio A', timestamp: Date.now() };
    // const meessageError = { text: 'Hola desde Microservicio A con Error', timestamp: Date.now() };
    //
    const message: Message = {
      trackingId: randomUUID(), // UUID único
      timestamp: new Date().toISOString(), // Marca de tiempo
      service: 'InvoiceService', // Nombre del servicio emisor
      payload: JSON.stringify({
        invoiceId: '12345',
        amount: 100,

      }, null, 2),
      text: 'Hola desde Microservicio A'
    };
    channel.sendToQueue(mainQueue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log('Mensaje enviado:', message);
    //INFO: para pruebas de error
    message.text = 'Hola desde Microservicio A con Error';
    channel.sendToQueue(mainQueue, Buffer.from(JSON.stringify(message, null, 2)), {
      persistent: true,
    });
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error enviando mensaje:', error);
  }
}

sendMessage();

