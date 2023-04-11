// Importation du modèle Sauce depuis le dossier "models"
const Sauce = require("../models/Sauce");
// Importation du module "fs" file system pour la gestion des fichiers 
const fs = require("fs");

// CRUD //

// Récupération de toutes les sauces existantes dans la bases de données //
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Ajout d'une nouvelle sauce dans la base de donnée //
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // Supression de l'Id généré par le frontend car il sera généré automatiquement par Mongodb //
  delete sauceObject._id;
  // Création d'une instance de la classe Sauce  avec les données de la requête//
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  // Enregistrement de la sauce dans la base de donnée //
  sauce.save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Modification d'une sauce existante dans la base de données par son créateur //
exports.modifySauce = (req, res, next) => {
  // Vérification si une nouvelle image à été ajoutée ou non
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageURL: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }?${Date.now()}`,
        // Ajouter un paramètre de requête unique pour forcer le navigateur à recharger l'image.
      }
    : { ...req.body };
      // Supression du champ_userId de l'objet de la sauce
  delete sauceObject._userId;
  // Recherche d'une sauce correspondante dans la base de donnée //
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérification que l'utilisateur qui fait la requête est bien le créateur de la sauce //
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ error: "Non autorisé" });
      } else {
        if (req.file) {
          // Si une nouvelle image a été ajoutée, supprimer l'ancienne image.
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            const sauceObject = { ...JSON.parse(req.body.sauce) };
            if (req.file) {
              sauceObject.imageUrl = `${req.protocol}://${req.get(
                "host"
              )}/images/${req.file.filename}`;
            }
            // Mettre à jour la sauce avec l'URL de la nouvelle image.
            Sauce.updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Objet modifié" }))
              .catch((error) => res.status(400).json({ error }));
          });
        } else {
          // Si aucune nouvelle image n'a été ajoutée, mettre à jour la sauce sans supprimer l'ancienne image.
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié" }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Suppression d'une sauce existante dans la base de données par son créateur//
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérification que l'utilisateur qui fait la requête est bien le créateur de la sauce //
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Suppression de l'image de la sauce dans le dossier "images"//
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Suppression de la sauce dans la base de donnée//
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Récupération d'une sauce en fonction de son ID//
exports.getOneSauce = (req, res, next) => {
  // Recherche d'une sauce correspondante dans la base de donnée //
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};


// Ajout de like ou dislike sur les sauces 
exports.likeDislikeSauce = (req, res, next) => {
  // Récupération de la valeur de like/dislike dans le corps de la requête 
  let likeStatus = req.body.like;

  // Si la valeur est égale à 1
  if (likeStatus === 1)
    // Recherche d'une sauce correspondante //
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (
        // Vérification si l'utilisateur à déjà liké ou dislike la sauce
        sauce.usersDisliked.includes(req.body.userId) ||
        sauce.usersLiked.includes(req.body.userId)
      ) {
        res.status(400).json({ message: "Opération non autorisée" });
      } else {
         // Mise à jour des likes incrémentation de la valeur de like et ajout de l'identifiant utilisateur dans la liste des utilisateurs qui ont like 
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like ajouté" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });

    // Si la valeur est égale à -1
  if (likeStatus === -1)
  // Recherche d'une sauce correspondante //
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (
        // Vérification si l'utilisateur à déjà liké ou dislike la sauce
        sauce.usersDisliked.includes(req.body.userId) ||
        sauce.usersLiked.includes(req.body.userId)
      ) {
        res.status(400).json({ message: "Opération non autorisée" });
      } else {
        // Mise à jour des dislikes incrémentation de la valeur de dislikes et ajout de l'utilisateur à la liste des userDisliked
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like ajouté" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
    // Si la valeur est égale à 0
  if (likeStatus === 0)
  // Recherche d'une sauce correspondante //
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si l'utilisateur à déjà like la sauce 
      if (sauce.usersLiked.includes(req.body.userId)) {
        // Mise à jour des likes incrémentation de la valeur (-1) et on retire l'utilisateur de la liste des likes 
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like retiré" }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Si l'utilisateur à déjà dislike la sauce 
      if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          // Mise à jour des dislikes incrémentation de la valeur (-1) et on retire l'utilisateur de la liste des dislikes 
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Dislike Retiré" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
};
