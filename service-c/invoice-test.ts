import amqp from 'amqplib';



const run = async () => {
try {
   const connection = await amqp.connect('amqp://localhost');
   const channel = await connection.createChannel();



   const mainExchange = 'facturas_exchange';
   const mainQueue = 'facturas_queue';
   const dlxExchange = 'facturas_dlx';
   const dlqQueue = 'facturas_dlq';
   const messageTtl = 4000; // 4 segundos



   // Configuración del DLX y la DLQ
   await channel.assertExchange(dlxExchange, 'direct', { durable: true });
   await channel.assertQueue(dlqQueue, { durable: true });
   await channel.bindQueue(dlqQueue, dlxExchange, '');



   // Configuración de la cola principal con DLX y TTL
   await channel.assertExchange(mainExchange, 'direct', { durable: true });
   await channel.assertQueue(mainQueue, {
     durable: true,
     arguments: {
       'x-dead-letter-exchange': dlxExchange,
       'x-message-ttl': messageTtl,
     },
   });
   await channel.bindQueue(mainQueue, mainExchange, '');



   // Productor (simula la generación de facturas)
   const generarFactura = (id: number) => ({ id, monto: Math.floor(Math.random() * 1000), estado: 'pendiente', retry: 0 });
   const factura1 = generarFactura(1);
   const factura2 = generarFactura(2);
   const factura3 = generarFactura(3);



   channel.publish(mainExchange, '', Buffer.from(JSON.stringify(factura1)));
   channel.publish(mainExchange, '', Buffer.from(JSON.stringify(factura2)));
   channel.publish(mainExchange, '', Buffer.from(JSON.stringify(factura3)));
   console.log('Facturas enviadas a la cola principal:', factura1, factura2, factura3);



   // Consumidor principal (procesa las facturas)
   channel.consume(mainQueue, (msg) => {
     if (msg) {
       const factura = JSON.parse(msg.content.toString());
       console.log('Procesando factura:', factura.id);



       if (factura.id === 2 && factura.retry < 2) { // Simula un error en la factura 2 las
primeras 2 veces.
         console.error('Error al procesar la factura:', factura.id, "Reintento numero: ", factura.retry + 1);
         factura.retry += 1;
         channel.ack(msg)
         setTimeout(() => {
           channel.publish(mainExchange, '', Buffer.from(JSON.stringify(factura)));
         }, 2000)
         return
       }



       if (factura.id === 3) {
         console.log("Simulando procesamiento largo de 5 segundos para la factura: ", factura.id)
         setTimeout(() => {
           console.log("Procesamiento largo finalizado para la factura: ", factura.id)
           channel.nack(msg, false, false)



         }, 5000)
         return
       }



       console.log('Factura procesada correctamente:', factura.id);
       channel.ack(msg);
     }
   });



   // Consumidor de la DLQ (gestiona las facturas fallidas)
   channel.consume(dlqQueue, (msg) => {
     if (msg) {
       const facturaFallida = JSON.parse(msg.content.toString());
       console.error('Factura FALLIDA en la DLQ:', facturaFallida);
       // Aquí se realizarían acciones como:
       // - Registrar el error en un log.
       // - Enviar una notificación al equipo de soporte.
       // - Intentar un reprocesamiento manual.
       channel.ack(msg);
     }
   }, { noAck: false });



 } catch (error) {
   console.error("Error en run():", error);
 }
};



run().catch(console.error);
