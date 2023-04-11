// Importation du module express
const express = require('express');
//Création d'un objet router à partir de express.Router()
const router = express.Router();

// Importation du contrôleur pour la gestion des sauces
const sauceCtrl = require('../controllers/sauce');
// Importation du middleware pour l'authentification 
const auth = require('../middleware/auth');
// Importation du middleware pour la gestion des fichiers
const multer = require('../middleware/multer-config');



// Définition des routes pour les opérations CRUD sur les sauces
// Obtenir la liste des sauces
router.get('/', auth, sauceCtrl.getAllSauce);
// Créer une nouvelle sauce
router.post('/', auth, multer, sauceCtrl.createSauce);
// Obtenir une sauce spécifique 
router.get('/:id', auth, sauceCtrl.getOneSauce);
// Modifier une sauce spécifique
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
// Supprimer une sauce spécifique
router.delete('/:id', auth, sauceCtrl.deleteSauce);
// Gestion des likes & dislikes sur une sauce 
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

// Exportation du router
module.exports = router;

