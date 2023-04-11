// Importation du module "multer" permet de gérer les fichiers envoyés via une requête HTTP 
const multer = require('multer');

// Types MIME autorisés et leur extension correspondantes
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'imahe/png': 'png'
}

// Configuration du stokage des images téléchargées
const storage = multer.diskStorage({
    // Destinatin du fichier 
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // Nom du fichier 
    filename: (req, file, callback) => {
        const name = file.originalname.split('').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

// Exportation de l'objet Multer configuré pour un seul fichier image
module.exports = multer({ storage: storage}).single('image');