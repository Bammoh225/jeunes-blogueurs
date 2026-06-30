# Structure du backend — Jeunes Blogueurs
## Stack : Node.js · TypeScript · Express · MySQL

```
jeunes-blogueurs-backend/
│
├── .env.example               ← Variables d'environnement à copier en .env
├── .gitignore                 ← Fichiers à ne pas envoyer sur Git (node_modules, .env...)
├── package.json               ← Dépendances et scripts npm
├── tsconfig.json              ← Configuration TypeScript
├── README.md                  ← Documentation du projet
│
└── src/
    │
    ├── server.ts              ← Point d'entrée : démarre le serveur sur le port
    ├── app.ts                 ← Configure Express (middlewares globaux, routes)
    │
    ├── config/
    │   ├── database.ts        ← Connexion MySQL (pool de connexions avec mysql2)
    │   └── env.ts             ← Chargement et validation des variables d'environnement
    │
    ├── types/
    │   ├── index.ts           ← Types TypeScript partagés (Role, Statut, etc.)
    │   └── express.d.ts       ← Extension du type Request Express (ajoute req.user)
    │
    ├── models/                ← Interfaces TypeScript qui reflètent les tables MySQL
    │   ├── utilisateur.model.ts
    │   ├── blogueur.model.ts
    │   ├── publication.model.ts
    │   ├── evaluation.model.ts
    │   ├── activite.model.ts
    │   ├── notification.model.ts
    │   ├── ville.model.ts
    │   ├── categorie.model.ts
    │   └── thematique.model.ts
    │
    ├── utils/
    │   ├── jwt.ts             ← Génération et vérification des tokens JWT
    │   ├── bcrypt.ts          ← Hachage et comparaison des mots de passe
    │   └── response.ts        ← Helpers pour formater les réponses API (success/error)
    │
    ├── middlewares/           ← S'exécutent avant chaque requête
    │   ├── auth.middleware.ts    ← Vérifie le token JWT dans le header Authorization
    │   ├── role.middleware.ts    ← Vérifie que le rôle a accès à la route
    │   ├── validate.middleware.ts← Valide le body avec Zod (schémas de validation)
    │   └── error.middleware.ts   ← Gestion centralisée de toutes les erreurs
    │
    ├── routes/                ← Définissent les URLs et appliquent les middlewares
    │   ├── auth.routes.ts        → POST /api/auth/login, POST /api/auth/logout
    │   ├── utilisateurs.routes.ts→ CRUD /api/utilisateurs (bénévoles)
    │   ├── blogueurs.routes.ts   → CRUD /api/blogueurs + /api/blogueurs/:id/profil
    │   ├── publications.routes.ts→ CRUD /api/publications
    │   ├── evaluations.routes.ts → POST /api/evaluations, GET par publication
    │   ├── activites.routes.ts   → CRUD /api/activites + participants
    │   ├── notifications.routes.ts→ GET /api/notifications, PATCH marquer lu
    │   └── villes.routes.ts      → GET /api/villes (liste des villes)
    │
    ├── controllers/           ← Reçoivent la requête, appellent le service, renvoient la réponse
    │   ├── auth.controller.ts
    │   ├── utilisateurs.controller.ts
    │   ├── blogueurs.controller.ts
    │   ├── publications.controller.ts
    │   ├── evaluations.controller.ts
    │   ├── activites.controller.ts
    │   ├── notifications.controller.ts
    │   └── villes.controller.ts
    │
    ├── services/              ← Contiennent toute la logique métier
    │   ├── auth.service.ts       ← Login, génération JWT, refresh
    │   ├── utilisateurs.service.ts← Créer/modifier/supprimer bénévoles
    │   ├── blogueurs.service.ts  ← Inscription, changement statut, stats
    │   ├── publications.service.ts← Soumettre, lister par catégorie/auteur
    │   ├── evaluations.service.ts← Évaluer une publication, historique
    │   ├── activites.service.ts  ← Créer activité, gérer participants
    │   ├── notifications.service.ts← Créer et envoyer notifications
    │   └── villes.service.ts     ← Lister les villes actives
    │
    └── repositories/          ← Seuls fichiers qui font du SQL
        ├── auth.repository.ts    ← findByEmail, updateLastLogin
        ├── utilisateurs.repository.ts
        ├── blogueurs.repository.ts
        ├── publications.repository.ts
        ├── evaluations.repository.ts
        ├── activites.repository.ts
        ├── notifications.repository.ts
        └── villes.repository.ts
```

---

## Flux d'une requête — exemple : soumettre une publication

```
Angular envoie POST /api/publications
    ↓
publications.routes.ts          → applique authMiddleware + validateBody
    ↓
auth.middleware.ts              → vérifie JWT, ajoute req.user
    ↓
validate.middleware.ts          → valide le body (titre, lien, categorie_id...)
    ↓
publications.controller.ts      → appelle publicationService.creer(req.body, req.user)
    ↓
publications.service.ts         → vérifie règles métier, appelle repository
                                → crée une notification pour le responsable catégorie
    ↓
publications.repository.ts      → INSERT INTO publications (...)
    ↓
Réponse JSON { success: true, data: publication }
```

---

## Permissions par rôle

| Route                        | unicef | technique | national | zone | categorie | com | blogueur |
|------------------------------|:------:|:---------:|:--------:|:----:|:---------:|:---:|:--------:|
| GET /blogueurs               | ✓      | ✓         | ✓        | ✓    | ✓         | ✓   | —        |
| POST /blogueurs              | ✓      | ✓         | ✓        | ✓    | —         | —   | ✓ (soi) |
| GET /publications            | ✓      | ✓         | ✓        | ✓    | ✓         | ✓   | ✓ (soi) |
| POST /publications           | ✓      | ✓         | —        | —    | —         | —   | ✓        |
| POST /evaluations            | ✓      | ✓         | —        | —    | —         | ✓   | —        |
| POST /activites              | ✓      | ✓         | ✓        | ✓    | —         | —   | —        |
| GET /utilisateurs            | ✓      | ✓         | ✓        | —    | —         | —   | —        |
| POST /utilisateurs           | ✓      | ✓         | —        | —    | —         | —   | —        |

---

## Dépendances à installer

```bash
npm install express mysql2 bcryptjs jsonwebtoken zod cors dotenv
npm install -D typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/cors
```

## Scripts npm

```json
"scripts": {
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```
