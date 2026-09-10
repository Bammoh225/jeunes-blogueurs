import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, process.env.DB_CA_CERT_PATH!))
    },
    multipleStatements: true
  });

  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '2026-09-10_gamification_badges.sql'), 'utf-8');
  
  console.log('Exécution de la migration...');
  await connection.query(sql);
  console.log('Migration réussie !');
  
  await connection.end();
}

run().catch(console.error);
