# Gestion des Voyageurs - Application Web MVC

Une application web moderne avec architecture MVC pour centraliser et gérer les informations sur les voyageurs que vous accueillez.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités principales

- **Gestion complète des voyageurs** : CRUD complet avec validation
- **Gestion des séjours** : Ajout, modification, suppression des séjours par voyageur
- **Interface moderne avec Tailwind CSS** : design responsive et professionnel
- **Gestion des statuts** : VIP, Normal, Compliqué avec codes couleur
- **Import automatique CSV** : import des réservations Superhôte avec création automatique des voyageurs
- **Validation robuste** : Côté client et serveur pour tous les formulaires
- **Formatage automatique** : Numéros de téléphone au format XX XX XX XX XX
- **Références uniques** : Contrainte d'unicité sur les références de réservation

### 🎨 Interface utilisateur

- **Tailwind CSS** : Design system moderne et responsive
- **Architecture MVC** : Séparation claire des responsabilités
- **Templates EJS** : Rendu côté serveur avec layouts
- **Navigation intuitive** : Interface utilisateur fluide
- **Messages flash** : Confirmations et erreurs claires
- **Validation en temps réel** : Feedback immédiat sur les formulaires

## 🏗️ Architecture MVC

### 📁 Structure du projet

``` bash
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
│   │   ├── edit-stay.ejs    # Modification séjour
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

#### 📊 Modèles (Models)

- `database.js` : Configuration et initialisation SQLite avec contraintes d'unicité
- `traveler.js` : Logique métier, requêtes voyageurs et séjours

#### 🎮 Contrôleurs (Controllers)

- `travelerController.js` : Gestion des requêtes et logique métier
- Validation des données côté serveur
- Gestion des erreurs et messages flash
- Rendu des vues avec gestion des erreurs

#### 👁️ Vues (Views)

- Templates EJS avec Tailwind CSS
- Layouts réutilisables
- Partials pour les composants
- Validation JavaScript côté client
- Formatage automatique des données

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

### Démarrage en développement

```bash
npm run dev
```

### Démarrage en production

```bash
npm start
```

L'application sera accessible à l'adresse : `http://localhost:3000`

## 📊 Structure de la base de données

### Table `travelers`

- `id` : Identifiant unique (AUTOINCREMENT)
- `first_name` : Prénom du voyageur (obligatoire)
- `name` : Nom du voyageur (obligatoire)
- `email` : Adresse email (optionnel, validation format)
- `phone` : Numéro de téléphone (optionnel, format XX XX XX XX XX)
- `status` : Statut (normal, vip, complique)
- `internal_notes` : Remarques internes
- `created_at` : Date de création
- `updated_at` : Date de modification

### Table `stays`

- `id` : Identifiant unique (AUTOINCREMENT)
- `traveler_id` : Référence vers le voyageur (FOREIGN KEY)
- `check_in_date` : Date d'arrivée (obligatoire)
- `check_out_date` : Date de départ (obligatoire)
- `booking_reference` : Référence de réservation (UNIQUE)
- `notes` : Notes sur le séjour
- `created_at` : Date de création

### Index et contraintes

- Index sur `travelers.email` pour les performances
- Index sur `stays.traveler_id` pour les jointures
- Index sur `stays.booking_reference` pour l'unicité
- Contrainte UNIQUE sur `stays.booking_reference`

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
- `GET /travelers/:id/stays/:stayId/edit` - Modifier un séjour
- `PUT /travelers/:id/stays/:stayId` - Mettre à jour un séjour
- `DELETE /travelers/:id/stays/:stayId` - Supprimer un séjour
- `GET /travelers/import/new` - Page d'import CSV
- `POST /travelers/import` - Traitement CSV

### 🔌 API REST (pour AJAX)

- `GET /travelers/api` - Liste tous les voyageurs (JSON)
- `GET /travelers/api/:id` - Détails d'un voyageur (JSON)
- `POST /travelers/api` - Créer un voyageur (JSON)
- `PUT /travelers/api/:id` - Modifier un voyageur (JSON)
- `DELETE /travelers/api/:id` - Supprimer un voyageur (JSON)

## 📋 Format CSV Superhôte

L'application est optimisée pour l'import de fichiers CSV au format Superhôte :

```csv
Guest first name,Guest last name,Email,Téléphone,Checkin,Checkout,Date de réservation,Prix,Nombre de voyageurs,Commission,Frais de ménage,Taxes,Commentaires
Jean,Dupont,jean@email.com,0123456789,2024-01-15,2024-01-20,REF123,150,2,10,20,15,Client VIP
Marie,Martin,marie@email.com,0987654321,2024-01-25,2024-01-30,REF124,200,3,15,25,20,
```

### Colonnes reconnues

- **Prénom** : `Guest first name`, `Guest First Name`, `first_name`
- **Nom** : `Guest last name`, `Guest Last Name`, `last_name`, `name`
- **Email** : `Email`, `email`
- **Téléphone** : `Téléphone`, `Phone`, `phone`
- **Date d'arrivée** : `Checkin`, `Check-in`, `checkin`, `check_in_date`
- **Date de départ** : `Checkout`, `Check-out`, `checkout`, `check_out_date`
- **Référence** : `Date de réservation`, `Booking Date`, `booking_date`
- **Notes** : Toutes les autres colonnes sont combinées dans les notes

## 🎯 Utilisation

### 1. Ajouter un voyageur manuellement

1. Aller sur `/travelers`
2. Cliquer sur "Nouveau Voyageur"
3. Remplir les informations :
   - **Prénom** : Obligatoire (minimum 2 caractères)
   - **Nom** : Obligatoire (minimum 2 caractères)
   - **Email** : Optionnel (validation format si fourni)
   - **Téléphone** : Optionnel (formatage automatique XX XX XX XX XX)
   - **Statut** : Normal, VIP, ou Compliqué
   - **Remarques internes** : Optionnel
4. Enregistrer

### 2. Importer des voyageurs via CSV

1. Aller sur `/travelers/import/new`
2. Sélectionner le fichier CSV au format Superhôte
3. L'application créera automatiquement :
   - Les voyageurs (nouveaux ou existants par email)
   - Les séjours avec références uniques
   - Les notes formatées avec prix, commission, etc.
4. Gestion des doublons : séjours ignorés si référence déjà existante

### 3. Gérer les voyageurs

- **Voir les détails** : Cliquer sur le nom d'un voyageur
- **Modifier** : Cliquer sur l'icône crayon
- **Supprimer** : Cliquer sur l'icône poubelle
- **Ajouter un séjour** : Dans les détails, cliquer sur "Ajouter un séjour"

### 4. Gérer les séjours

- **Modifier un séjour** : Cliquer sur "Modifier" dans la liste des séjours
- **Supprimer un séjour** : Cliquer sur "Supprimer" ou utiliser le bouton dans l'édition
- **Validation des dates** : La date de départ doit être postérieure à l'arrivée

### 5. Filtrer et rechercher

- **Recherche** : Tapez dans la barre de recherche (nom, email, téléphone)
- **Filtre par statut** : Utilisez le menu déroulant

## 🎨 Design System

### 🎨 Tailwind CSS

- **Couleurs primaires** : Bleu (#3b82f6)
- **Statuts**  
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

- **SQLite** : Base de données locale dans `data/travelers.db`
- **Migration automatique** : Ajout de colonnes si nécessaire
- **Contraintes** : Intégrité référentielle et unicité

### Validation

- **Côté client** : JavaScript pour feedback immédiat
- **Côté serveur** : Validation Express pour sécurité
- **Formatage** : Numéros de téléphone automatique
- **Messages d'erreur** : Localisés en français

### Sécurité

- **Validation des entrées** : Tous les formulaires
- **Protection CSRF** : Method-override pour PUT/DELETE
- **Gestion des fichiers** : Validation des types CSV
- **Messages flash** : Session pour les confirmations

## 📦 Dépendances principales

- **Express.js** : Framework web
- **EJS** : Moteur de templates
- **SQLite3** : Base de données
- **Tailwind CSS** : Framework CSS
- **Multer** : Gestion des uploads
- **CSV-parser** : Parsing des fichiers CSV
- **Express-session** : Gestion des sessions
- **Connect-flash** : Messages flash
- **Method-override** : Support PUT/DELETE
- **Express-layouts** : Layouts EJS
- **Nodemon** : Redémarrage automatique (dev)

## 🚀 Fonctionnalités avancées

### Import CSV intelligent

- **Détection automatique** des colonnes Superhôte
- **Gestion des doublons** par référence de réservation
- **Formatage des notes** avec prix, commission, taxes
- **Statistiques d'import** : créés, mis à jour, ignorés

### Validation robuste

- **Prénom et nom** : Obligatoires, minimum 2 caractères
- **Email** : Format valide si fourni
- **Téléphone** : Minimum 10 chiffres si fourni
- **Dates de séjour** : Logique temporelle
- **Références** : Unicité garantie

### Interface utilisateur

- **Formatage automatique** des numéros de téléphone
- **Validation en temps réel** sur les formulaires
- **Messages flash** pour les confirmations
- **Design responsive** et moderne
- **Navigation intuitive** avec breadcrumbs

Cette application offre une solution complète pour la gestion des voyageurs avec une interface moderne, des fonctionnalités avancées et une architecture robuste.
