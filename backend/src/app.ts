import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
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

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API Jeunes Blogueurs opérationnelle' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

app.use(errorMiddleware);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limite requêtes
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
export default app;
