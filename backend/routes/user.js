// Importation du module express
const express = require('express');
//Création d'un objet router à partir de express.Router()
const router = express.Router();

// Importation du contrôleur pour la gestion des utilisateurs
const userCtrl= require('../controllers/user');

// Définition des routes pour l'enregistrement et la connexion d'un utilisateur
// Enregistrement d'un nouvelle utilisateur
router.post('/signup', userCtrl.signup);
// Connexion d'un utilisateur existant 
router.post('/login', userCtrl.login);


// Exportation du router 
module.exports = router;