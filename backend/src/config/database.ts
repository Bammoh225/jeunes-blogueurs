import mysql from 'mysql2/promise';
import fs from 'fs';
import { env } from './env';

function getSslConfig() {
  if (env.DB_SSL !== 'true') return undefined;

  // Priorité au contenu direct (Render) — sinon fallback sur le fichier (local)
  const ca = env.DB_CA_CERT_CONTENT
    ? env.DB_CA_CERT_CONTENT.replace(/\\n/g, '\n')
    : fs.readFileSync(env.DB_CA_CERT_PATH, 'utf8');

  return { ca };
}

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
  ssl:                getSslConfig(),
});

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

export const closeDB = async () => {
  await pool.end();
};