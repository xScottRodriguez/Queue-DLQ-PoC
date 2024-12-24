import { resolve } from 'path';
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database(resolve(__dirname, './db/error_logs.db'));

// Crear tabla para registrar errores
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS error_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      service_name TEXT NOT NULL,
      original_payload TEXT NOT NULL,
      error_message TEXT
    )
  `);
  console.log('Tabla creada o ya existe.');
});


export {
  db
}
