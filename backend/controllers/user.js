// Importation du modèle User depuis le dossier "models"
const User = require('../models/User');
// Importation du module "bcrypt" qui va chiffrer le mot de passe avant de le stocker dans la base de données
const bcrypt = require('bcrypt');
// Importation du module "jsonwebtoken" qui va générer le token JWT pour l'authentification et l'autorisation. 
const jwt = require('jsonwebtoken');


// Ajout d'un utilisateur dans la base de données
exports.signup = (req, res, next) => {
    // Hash du mot de passe reçu dans la requête
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // Création d'un nouveau utilisateur avec email et mot de passe hashé
        const user = new User({
            email: req.body.email,
            password: hash
        });
        // Enregistrement de l'utilisateur dans la base de données
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    };

    // Vérification de l'existance de l'utilisateur dans la base de données pour ce log 
exports.login = (req, res, next) => {
    // Recherche de utilisateur avec son email dans la requête 
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // Comparaison du mot de passe fourni par l'utilisateur avec celui stocké dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Vérification si il est valide 
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // Envoi un token d'iendtification avec l'ID de l'utilisateur 
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };