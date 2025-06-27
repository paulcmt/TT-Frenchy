# Gestion des Voyageurs - Application Web MVC

Une application web moderne avec architecture MVC pour centraliser et gérer les informations sur les voyageurs que vous accueillez.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités principales
- **Fiche voyageur complète** : nom, email, téléphone, séjours passés, remarques internes
- **Interface moderne avec Tailwind CSS** : design responsive et professionnel
- **Gestion des statuts** : VIP, Normal, Compliqué avec codes couleur
- **Import automatique CSV** : import des réservations Superhôte avec création automatique des voyageurs
- **Historique des séjours** : suivi complet des séjours par voyageur

### 🎨 Interface utilisateur
- **Tailwind CSS** : Design system moderne et responsive
- **Architecture MVC** : Séparation claire des responsabilités
- **Templates EJS** : Rendu côté serveur avec layouts
- **Navigation intuitive** : Interface utilisateur fluide
- **Messages de feedback** : Confirmations et erreurs claires

## 🏗️ Architecture MVC

### 📁 Structure du projet
```
test_technique_jacquet/
├── models/                    # Modèles (données)
│   ├── database.js           # Configuration SQLite
│   └── traveler.js           # Modèle Voyageur
├── views/                    # Vues (interface)
│   ├── layouts/
│   │   └── main.ejs         # Layout principal
│   ├── partials/
│   │   └── status-badge.ejs  # Composant réutilisable
│   ├── travelers/
│   │   ├── index.ejs        # Liste des voyageurs
│   │   ├── new.ejs          # Formulaire création
│   │   ├── edit.ejs         # Formulaire modification
│   │   ├── show.ejs         # Détails voyageur
│   │   └── import.ejs       # Import CSV
│   └── error.ejs            # Page d'erreur
├── controllers/              # Contrôleurs (logique)
│   └── travelerController.js # Contrôleur voyageurs
├── routes/                   # Routes (routage)
│   └── travelers.js         # Routes voyageurs
├── services/                 # Services (métier)
│   └── csvImporter.js       # Import CSV
├── public/                   # Fichiers statiques
│   └── stylesheets/
│       └── tailwind.css     # Styles Tailwind
├── data/                     # Base de données SQLite
├── uploads/                  # Fichiers temporaires
├── app.js                    # Configuration Express
└── package.json             # Dépendances
```

### 🔧 Composants MVC

**📊 Modèles (Models)**
- `database.js` : Configuration et initialisation SQLite
- `traveler.js` : Logique métier et requêtes voyageurs

**🎮 Contrôleurs (Controllers)**
- `travelerController.js` : Gestion des requêtes et logique métier
- Validation des données
- Gestion des erreurs
- Rendu des vues

**👁️ Vues (Views)**
- Templates EJS avec Tailwind CSS
- Layouts réutilisables
- Partials pour les composants
- Rendu côté serveur

## 🛠️ Installation et démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation
1. Cloner ou télécharger le projet
2. Installer les dépendances :
```bash
npm install
```

### Démarrage
```bash
npm start
```

L'application sera accessible à l'adresse : `http://localhost:3000`

## 📊 Structure de la base de données

### Table `travelers`
- `id` : Identifiant unique
- `name` : Nom du voyageur (obligatoire)
- `email` : Adresse email
- `phone` : Numéro de téléphone
- `status` : Statut (normal, vip, complique)
- `internal_notes` : Remarques internes
- `created_at` : Date de création
- `updated_at` : Date de modification

### Table `stays`
- `id` : Identifiant unique
- `traveler_id` : Référence vers le voyageur
- `check_in_date` : Date d'arrivée
- `check_out_date` : Date de départ
- `booking_reference` : Référence de réservation
- `notes` : Notes sur le séjour
- `created_at` : Date de création

## 🔌 Routes disponibles

### 🌐 Interface utilisateur (MVC)
- `GET /` → Redirection vers `/travelers`
- `GET /travelers` - Liste tous les voyageurs
- `GET /travelers/new` - Formulaire de création
- `POST /travelers` - Créer un voyageur
- `GET /travelers/:id` - Détails d'un voyageur
- `GET /travelers/:id/edit` - Formulaire de modification
- `PUT /travelers/:id` - Modifier un voyageur
- `DELETE /travelers/:id` - Supprimer un voyageur
- `POST /travelers/:id/stays` - Ajouter un séjour
- `GET /travelers/import/new` - Page d'import CSV
- `POST /travelers/import` - Traitement CSV

### 🔌 API REST (pour AJAX)
- `GET /travelers/api` - Liste tous les voyageurs (JSON)
- `GET /travelers/api/:id` - Détails d'un voyageur (JSON)
- `POST /travelers/api` - Créer un voyageur (JSON)
- `PUT /travelers/api/:id` - Modifier un voyageur (JSON)
- `DELETE /travelers/api/:id` - Supprimer un voyageur (JSON)

## 📋 Format CSV attendu

L'application peut importer des fichiers CSV avec les colonnes suivantes (noms flexibles) :

```csv
guest_name,guest_email,guest_phone,check_in,check_out,booking_id,notes
Jean Dupont,jean@email.com,0123456789,2024-01-15,2024-01-20,REF123,Client VIP
Marie Martin,marie@email.com,0987654321,2024-01-25,2024-01-30,REF124,
```

### Colonnes reconnues
- **Nom** : `guest_name`, `name`, `Guest Name`
- **Email** : `guest_email`, `email`, `Guest Email`
- **Téléphone** : `guest_phone`, `phone`, `Guest Phone`
- **Date d'arrivée** : `check_in`, `checkin`, `Check-in Date`
- **Date de départ** : `check_out`, `checkout`, `Check-out Date`
- **Référence** : `booking_id`, `reference`, `Booking ID`
- **Notes** : `notes`, `comments`

## 🎯 Utilisation

### 1. Ajouter un voyageur manuellement
1. Aller sur `/travelers`
2. Cliquer sur "Nouveau Voyageur"
3. Remplir les informations (nom obligatoire)
4. Choisir le statut
5. Ajouter des remarques internes si nécessaire
6. Enregistrer

### 2. Importer des voyageurs via CSV
1. Aller sur `/travelers/import/new`
2. Sélectionner le fichier CSV
3. L'application créera automatiquement les voyageurs et leurs séjours
4. Les voyageurs existants (même email) auront leurs séjours ajoutés

### 3. Gérer les voyageurs
- **Voir les détails** : Cliquer sur le nom d'un voyageur
- **Modifier** : Cliquer sur l'icône crayon
- **Supprimer** : Cliquer sur l'icône poubelle
- **Ajouter un séjour** : Dans les détails, cliquer sur "Ajouter un séjour"

### 4. Filtrer et rechercher
- **Recherche** : Tapez dans la barre de recherche (nom, email, téléphone)
- **Filtre par statut** : Utilisez le menu déroulant

## 🎨 Design System

### 🎨 Tailwind CSS
- **Couleurs primaires** : Bleu (#3b82f6)
- **Statuts** : 
  - Normal : Vert (#10b981)
  - VIP : Jaune (#f59e0b)
  - Compliqué : Rouge (#ef4444)
- **Responsive** : Mobile-first design
- **Composants** : Boutons, formulaires, cartes, modales

### 📱 Responsive Design
- **Mobile** : Interface adaptée aux petits écrans
- **Tablet** : Layout intermédiaire
- **Desktop** : Interface complète avec sidebar

## 🔧 Configuration

### Base de données
La base de données SQLite est automatiquement créée dans le dossier `data/` au premier démarrage.

### Fichiers temporaires
Les fichiers CSV uploadés sont temporairement stockés dans le dossier `uploads/` et supprimés après traitement.

### Variables d'environnement
- `PORT` : Port du serveur (défaut: 3000)
- `NODE_ENV` : Environnement (development/production)

## 📝 Technologies utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **SQLite** : Base de données légère
- **EJS** : Moteur de templates
- **Multer** : Gestion des uploads
- **csv-parser** : Parsing des fichiers CSV

### Frontend
- **Tailwind CSS** : Framework CSS utilitaire
- **Font Awesome** : Icônes
- **JavaScript vanilla** : Interactions côté client

### Architecture
- **MVC** : Modèle-Vue-Contrôleur
- **REST** : API RESTful
- **Server-side rendering** : Rendu côté serveur

## 🚀 Déploiement

L'application peut être déployée sur :
- Heroku
- Vercel
- AWS
- Serveur VPS

### Prérequis de déploiement
- Node.js 14+
- Base de données SQLite (ou migration vers PostgreSQL/MySQL)
- Variables d'environnement configurées

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. 