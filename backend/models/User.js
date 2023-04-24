// Importation du module "mongoose"
const mongoose = require('mongoose');
// Importation du module "mongoose-unique-validator" afin de fournir s'assurer de la nom utilisation d'une même adresse mail par l'utilisateur 
const uniqueValidator = require('mongoose-unique-validator');


// Définition de schéma de l'utilisateur 
const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

// Utilisation du plugin uniqueValidator pour validité que l'email est bien unique
userSchema.plugin(uniqueValidator);



// Exportation du modèle utilisateur
module.exports = mongoose.model('User', userSchema);
