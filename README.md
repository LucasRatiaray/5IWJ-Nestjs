# ConsignArt

API REST NestJS pour la consignation d'œuvres d'art entre galeries, artistes et collectionneurs.

## Installation et lancement

Prérequis : Docker et Docker Compose.

```bash
git clone <repo> consignart
cd consignart
cp .env.example .env.development.local
```

Remplir les variables dans `.env.development.local` (secrets JWT à générer avec `openssl rand -base64 48`).

```bash
docker compose -f compose.development.yaml up -d
```

Attendre que les logs affichent `Nest application successfully started`, puis :

```bash
npm run migration:run   # crée les tables
npm run seed:admin      # crée le compte admin (ADMIN_EMAIL / ADMIN_PASSWORD du .env)
```

L'API est disponible sur `http://localhost:3000/api/v1`.

### Lancer la version production

```bash
cp .env.example .env.production.local   # remplir avec de vraies valeurs
docker compose up --build
```

Cette commande construit l'image, démarre l'API et la base, puis applique automatiquement les migrations et crée le compte admin au démarrage.

## Rôles et comptes

| Rôle | Comment l'obtenir | Rôle métier |
|---|---|---|
| `admin` | `npm run seed:admin` | Valide les comptes galerie, transfère les artistes, consulte les stats globales. |
| `gallery` | `POST /auth/register` (`role: "gallery"`) — **inactif** jusqu'à validation par un admin | Dépose et gère des œuvres, enregistre les ventes, organise expositions et prêts. |
| `collector` | `POST /auth/register` (`role: "collector"`) — actif immédiatement | Consulte le catalogue, exprime une intention d'achat, consulte ses factures. |
| `artist` | Créé par sa galerie via `POST /artists` ; fournir `email` + `password` dans le corps pour lui ouvrir un compte (sinon simple fiche catalogue) | Suit ses œuvres et ses revenus. |

## Modèle de données

### Comptes

| Entité | Rôle |
|---|---|
| **User** | Le compte de connexion : email, mot de passe, rôle (`admin`, `gallery`, `artist`, `collector`). |
| **Gallery** | Profil d'une galerie, lié à un `User`. |
| **Artist** | Profil d'un artiste, lié à une `Gallery`. Le lien vers un `User` est optionnel — un artiste peut être catalogué sans avoir de compte. |
| **Collector** | Profil d'un collectionneur, lié à un `User`. |

### Œuvres et ventes

| Entité | Rôle |
|---|---|
| **Artwork** | Une œuvre : appartient à une `Gallery` et à un `Artist`. A un statut (`available`, `on_loan`, `sold`, `returned`). |
| **ArtworkStatusHistory** | L'historique des changements de statut d'une œuvre. |
| **Sale** | Une vente : relie une `Artwork` à un `Collector`, avec le prix et la commission de la galerie. |
| **Invoice** | La facture générée pour le collectionneur lors d'une vente. |
| **ArtistStatement** | Le relevé du montant reversé à l'artiste après une vente. |

### Expositions et prêts

| Entité | Rôle |
|---|---|
| **Exhibition** | Une exposition organisée par une galerie, regroupant plusieurs `Artwork`. |
| **Loan** | Un prêt d'une `Artwork` d'une galerie source vers une galerie destination. |

### Suivi

| Entité | Rôle |
|---|---|
| **PurchaseRequest** | L'intention d'achat d'un `Collector` sur une `Artwork` ; la galerie confirme (déclenche la vente) ou refuse. |
| **ArtistTransferRequest** | Journal des transferts d'artiste entre galeries (galerie d'origine, galerie cible, admin décideur, date). |

### Comment tout se relie

- Un `User` a **un seul** profil : `Gallery`, `Artist` ou `Collector`.
- Une `Gallery` a plusieurs `Artist` et plusieurs `Artwork`.
- Un `Artist` appartient à une seule `Gallery` et a plusieurs `Artwork`.
- Une `Artwork` appartient à une `Gallery` et à un `Artist`, et garde l'historique de ses statuts.
- Une vente (`Sale`) concerne une `Artwork` et un `Collector`, et génère une `Invoice` (pour le collectionneur) et un `ArtistStatement` (pour l'artiste).
- Une `Exhibition` regroupe plusieurs `Artwork` d'une même galerie ; le temps de l'exposition, ces œuvres passent au statut `on_loan`.
- Un `Loan` relie une `Artwork` à deux galeries (source et destination) ; l'œuvre passe aussi au statut `on_loan` le temps du prêt.
- Un transfert d'artiste entre galeries est réservé à l'admin et journalisé dans `ArtistTransferRequest`.

## Fonctionnalités et endpoints

Toutes les routes sont préfixées par `/api/v1`. Sauf mention contraire, un access token JWT est requis (`Authorization: Bearer …`).

| Ressource | Endpoints | Accès |
|---|---|---|
| `auth` | `POST /auth/{register,login,refresh}` | public |
| `users` | `GET /users/me` ; `GET/PATCH /users/:id` (soi-même ou admin) ; `GET /users`, `DELETE /users/:id`, `PATCH /users/:id/{activate,deactivate}` | selon le rôle ; admin pour la liste et l'activation |
| `galleries` | `GET /galleries` | gallery, admin |
| `artists` | `POST /artists` ; `GET /artists`, `GET /artists/:id` ; `PATCH /artists/:id`, `DELETE /artists/:id` ; `PATCH /artists/:id/transfer` | gallery propriétaire ; `transfer` réservé admin |
| `collectors` | `GET /collectors` | gallery, admin |
| `artworks` | `POST /artworks` ; `GET /artworks?consignedAfter=JJ/MM/AAAA`, `GET /artworks/:id` ; `PATCH /artworks/:id`, `DELETE /artworks/:id` | gallery propriétaire ; lecture ouverte à tout compte |
| `purchase-requests` | `POST /purchase-requests` (collector) ; `GET /purchase-requests` (filtré par rôle) ; `PATCH /purchase-requests/:id/{confirm,reject}` (gallery) | collector / gallery |
| `sales` | `POST /sales` (gallery) ; `GET /sales`, `GET /sales/:id` | lecture filtrée par rôle (galerie / artiste / collector / admin) |
| `invoices` | `GET /invoices` | collector |
| `artist-statements` | `GET /artist-statements` | artist |
| `exhibitions` | `POST /exhibitions` ; `GET /exhibitions`, `GET /exhibitions/:id` ; `DELETE /exhibitions/:id` | gallery propriétaire / admin ; lecture authentifiée |
| `loans` | `POST /loans` ; `GET /loans`, `GET /loans/:id` ; `PATCH /loans/:id/return` | galerie source ou destination / admin |
| `reports` | `GET /reports/{gallery,artist,admin}` | le rôle correspondant |

### Règles métier

- Un compte `gallery` reste inactif tant qu'un admin ne l'a pas validé (`PATCH /users/:id/activate`).
- Un artiste appartient à une seule galerie ; le transfert est réservé à l'admin et tracé.
- Un artiste ne peut pas dépasser 50 œuvres `available` (pipe de validation métier → HTTP 422).
- Une œuvre ne peut pas être vendue sous son prix de réserve, ni si elle n'est pas `available` (→ HTTP 422).
- Commission de la galerie par palier : 40 % jusqu'à 5 000 €, 35 % jusqu'à 20 000 €, 30 % au-delà. Solde artiste = prix de vente − commission.
- Une vente s'exécute dans une transaction : `Sale` + `Invoice` + `ArtistStatement` + passage de l'œuvre à `sold` + ligne d'historique.
- Une exposition exige au moins une œuvre ; ses œuvres passent `on_loan` le temps de l'exposition.
- Un prêt est impossible sur une œuvre déjà `on_loan` ou dont les dates chevauchent un prêt existant.
- Tout changement de statut d'œuvre est enregistré dans `ArtworkStatusHistory`.

## Choix techniques

- **PostgreSQL** (via Docker) plutôt que SQLite : enums natifs, contraintes de clé étrangère, `date_trunc` pour les rapports, parité dev / prod.
- **Authentification** : `AuthGuard` maison appliqué globalement au-dessus de `@nestjs/jwt`, access token + refresh token (secret dédié). Mots de passe hachés avec `bcrypt` (12 rounds).
- **Guards personnalisés** : `RolesGuard` + décorateur `@Roles()` ; `OwnershipGuard` (accès restreint à sa propre ressource).
- **Pipes personnalisés** : `ParseFrenchDatePipe` (transformation `JJ/MM/AAAA` → `Date`), `ArtworkQuotaPipe` (validation métier du quota d'œuvres).
- **Interceptors** : enveloppe de réponse `{ data, meta, timestamp }` sur les succès ; logging d'une ligne par requête (`méthode url statut durée utilisateur`).
- **Exception filters** : filtre global (`@Catch()`) qui normalise toutes les erreurs en corps non enveloppé ; `BusinessRuleViolationFilter` dédié aux violations de règles métier → HTTP 422.
- **Transactions** : `QueryRunner` explicite pour la vente et l'inscription ; `dataSource.transaction()` pour les autres opérations multi-écritures.
- **TypeORM** : migrations (pas de `synchronize`), index sur `artworks.status`, relations `ManyToOne` / `OneToMany` / `ManyToMany` (œuvre ↔ exposition).
- **Configuration** : `@nestjs/config` avec validation Joi des variables d'environnement au démarrage.
- **Docker** : image multi-stage (build + runtime), exécution en `USER node`, base de données sans port publié en production.
- **Écart assumé** : image `node:22-alpine` au lieu du `node:20-alpine` demandé — Node 20 est en fin de support depuis avril 2026.
- Swagger : non implémenté (bonus optionnel du sujet).

## Tests

```bash
npm test                    # tests unitaires (Jest)
npm run test:e2e:docker     # test d'intégration, exécuté dans le conteneur
```

- **Unitaires** : calcul de commission, changement de statut d'œuvre et garde-fous de la vente ; `RolesGuard`, `OwnershipGuard` ; `ParseFrenchDatePipe`, `ArtworkQuotaPipe`.
- **Intégration** : `POST /sales` de bout en bout (validation → guard → service → transaction → base), dans `test/sales.e2e-spec.ts`.
