// Importation du module express
const express = require('express');
// Importation du module mongoose
const mongoose = require('mongoose');
// Importation du module "fs" file system pour la gestion des fichiers 
const fs = require('fs');
// Importation du module "path" pour la gestion des fichiers 
const path = require('path');

// Importation des routes pour la gestion des sauces et des utilisateurs
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Connexion à la base de donnée MongoDB
mongoose.connect('mongodb+srv://maximeR:pD4hUFokxkD3wUu0@mfactory.lhfwbp6.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création de l'application express
const app = express();

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utilisation du middleware pour la gestion des données JSON 
app.use(express.json());

// Configuration des routes 
// Accès aux images
app.use('/images', express.static(path.join(__dirname, 'images')));
// Configuration route pour les sauces 
app.use('/api/sauces', sauceRoutes);
// Configuration route pour les utilisateurs
app.use('/api/auth', userRoutes);

// Exportation de app
module.exports = app;