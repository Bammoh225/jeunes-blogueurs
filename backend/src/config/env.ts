import dotenv from 'dotenv';
dotenv.config();

// Vérifie que toutes les variables obligatoires sont présentes au démarrage
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV:       process.env.NODE_ENV || 'development',
  PORT:           parseInt(process.env.PORT || '3000', 10),

  DB_HOST:        requireEnv('DB_HOST'),
  DB_PORT:        parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER:        requireEnv('DB_USER'),
  DB_PASSWORD:    requireEnv('DB_PASSWORD'),
  DB_NAME:        requireEnv('DB_NAME'),

  JWT_SECRET:     requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  CORS_ORIGIN:    process.env.CORS_ORIGIN || '*',  // Autorise toutes les origines pour le développement
};
