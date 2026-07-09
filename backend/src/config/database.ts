import mysql from 'mysql2/promise';
import { env } from './env';

// Pool de connexions : réutilise les connexions au lieu d'en créer une à chaque requête
export const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  database:           env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,      // max 10 connexions simultanées
  queueLimit:         0,
  charset:            'utf8mb4',
});

// Teste la connexion au démarrage
export async function connectDB(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    console.log('✓ Connexion MySQL établie');
    conn.release();
  } catch (error) {
    console.error('✗ Échec connexion MySQL :', error);
    process.exit(1); // Arrête le serveur si la DB est inaccessible
  }
}
export const closeDB = async () => {
  await pool.end();
};
