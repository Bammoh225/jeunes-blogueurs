import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`✓ Serveur démarré sur http://0.0.0.0:${env.PORT}`);
    console.log(`  Environnement : ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error('Erreur au démarrage :', err);
  process.exit(1);
});
