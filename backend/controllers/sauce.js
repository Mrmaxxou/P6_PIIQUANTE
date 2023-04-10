const Sauce = require("../models/Sauce");
const fs = require("fs");

// Afficher toutes les sauces //
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Ajouter une nouvelle sauce //
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
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
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Modifier une sauce uniquement si vous êtes le créateur de celle ci //
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageURL: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }?${Date.now()}`,
        // Ajouter un paramètre de requête unique pour forcer le navigateur à recharger l'image.
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
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

// Supprimer une sauce uniquement si vous êtes le créateur de celle ci //
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
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

// Afficher une seule sauce //
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};



exports.likeDislikeSauce = (req, res, next) => {
  let likeStatus = req.body.like;

  if (likeStatus === 1)
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (
        sauce.usersDisliked.includes(req.body.userId) ||
        sauce.usersLiked.includes(req.body.userId)
      ) {
        res.status(400).json({ message: "Opération non autorisée" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like ajouté" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });

  if (likeStatus === -1)
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (
        sauce.usersDisliked.includes(req.body.userId) ||
        sauce.usersLiked.includes(req.body.userId)
      ) {
        res.status(400).json({ message: "Opération non autorisée" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like ajouté" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });

  if (likeStatus === 0)
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Like retiré" }))
          .catch((error) => res.status(400).json({ error }));
      }

      if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Dislike Retiré" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
};
