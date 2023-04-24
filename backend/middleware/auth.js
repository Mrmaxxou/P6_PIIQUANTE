// Importation du module "jsonwebtoken" 
const jwt = require('jsonwebtoken');

// Exportation du middleware
module.exports = (req, res, next) => {
   try {
    // Récupération du token dans le header de la requête
       const token = req.headers.authorization.split(' ')[1];
       // Vérification et décryptage du token 
       const decodedToken = jwt.verify(token, '327388feaacb2bdcd507d18ebe6ced7b');
       // Récupération de l'ID de l'utilisateur depuis le token décrypté
       const userId = decodedToken.userId;
       // Ajout de l'ID de l'utilisateur à l'objet auth dans la requête 
       req.auth = {
           userId: userId
       };
       // Appel de la fonction next() pour passer au middleware suivant 
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};