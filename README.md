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

### Comment tout se relie

- Un `User` a **un seul** profil : `Gallery`, `Artist` ou `Collector`.
- Une `Gallery` a plusieurs `Artist` et plusieurs `Artwork`.
- Un `Artist` appartient à une seule `Gallery` et a plusieurs `Artwork`.
- Une `Artwork` appartient à une `Gallery` et à un `Artist`, et garde l'historique de ses statuts.
- Une vente (`Sale`) concerne une `Artwork` et un `Collector`, et génère une `Invoice` (pour le collectionneur) et un `ArtistStatement` (pour l'artiste).
- Une `Exhibition` regroupe plusieurs `Artwork` d'une même galerie ; le temps de l'exposition, ces œuvres passent au statut `on_loan`.
- Un `Loan` relie une `Artwork` à deux galeries (source et destination) ; l'œuvre passe aussi au statut `on_loan` le temps du prêt.
