import mysql from 'mysql2/promise';
import { env } from './env';
import fs from 'fs';
import path from 'path';

// Certificat CA utilisé uniquement lorsque SSL est activé
const ssl =
  env.DB_SSL === 'true'
    ? {
        ca: env.DB_CA_CERT_PATH
          ? fs.readFileSync(
              path.resolve(process.cwd(), env.DB_CA_CERT_PATH)
            )
          : undefined,
        rejectUnauthorized: true,
      }
    : undefined;

// Pool de connexions : réutilise les connexions au lieu d'en créer une à chaque requête
export const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  database:           env.DB_NAME,

  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',

  // SSL activé sur Aiven/Render, désactivé en local
  ssl,
});

// Teste la connexion au démarrage
export async function connectDB(): Promise<void> {
  try {
    const conn = await pool.getConnection();

    console.log('✓ Connexion MySQL établie');

    conn.release();
  } catch (error) {
    console.error('✗ Échec connexion MySQL :', error);
    process.exit(1);
  }
}

export const closeDB = async (): Promise<void> => {
  await pool.end();
};