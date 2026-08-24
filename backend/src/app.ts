import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { pool } from './config/database';
import { errorMiddleware } from './middlewares/error.middleware';

import authRoutes          from './routes/auth.routes';
import utilisateursRoutes  from './routes/utilisateurs.routes';
import blogueursRoutes     from './routes/blogueurs.routes';
import publicationsRoutes  from './routes/publications.routes';
import evaluationsRoutes   from './routes/evaluations.routes';
import activitesRoutes     from './routes/activites.routes';
import notificationsRoutes from './routes/notifications.routes';
import villesRoutes        from './routes/villes.routes';
import thematiquesRoutes   from './routes/thematiques.routes';
import distributionsRoutes from './routes/distributions.routes';

const app = express();

// Middlewares de sécurité et réseau (exécutés AVANT les routes)
app.use(helmet());
app.use(compression());

const corsOrigin = env.CORS_ORIGIN;
const allowedOrigins = (corsOrigin === '*' || !corsOrigin)
  ? true
  : corsOrigin.split(',').map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'X-Requested-With', 'Accept']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 2000 : 100, // Plus permissif en dev
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check avec statut de la base de données
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'API Jeunes Blogueurs opérationnelle',
      database: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'API opérationnelle mais base de données inaccessible',
      database: 'ERROR',
      error: env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Enregistrement des routes API
app.use('/api/auth',          authRoutes);
app.use('/api/utilisateurs',  utilisateursRoutes);
app.use('/api/blogueurs',     blogueursRoutes);
app.use('/api/publications',  publicationsRoutes);
app.use('/api/evaluations',   evaluationsRoutes);
app.use('/api/activites',     activitesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/villes',        villesRoutes);
app.use('/api/thematiques',   thematiquesRoutes);
app.use('/api/distributions', distributionsRoutes);

// Route 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// Middleware d'erreur global
app.use(errorMiddleware);

export default app;

