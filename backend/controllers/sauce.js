/* Import des modules necessaires */
const Sauce = require("../models/sauce");
// fs package de Node signifie file system (système de fichiers) 
//  fs nous donne accès aux fonctions qui nous permettent de modifier le système de fichier également aux fonctions permettant de supprimer les fichiers
const fs = require("fs");

/* Controleur creation sauce */
exports.createSauce = (req, res, next) => {
    // In nous faut parser(chaîne de caractères)
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(req.body.sauce);

    const sauce = new Sauce({
        ...sauceObject,
        // host (le nom d'hôte)
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
            }`,
        // Initialisation 
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch((error) => res.status(400).json({ error }));
};

/* Controleur recuperation 1 sauce */
exports.getOneSauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({
        _id: req.params.id,
    })
        // Affichage sauce
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

/* Controleur modification sauce */
exports.modifySauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Enregistrement ancienne imgUrl (si nouvelle image dans modify)
            const oldUrl = sauce.imageUrl;
            // Recuperation nom de l'image
            const filename = sauce.imageUrl.split("/images/")[1];
            // Suppression de l'image dans le dossier local
            if (req.file) {
                fs.unlink(`images/${filename}`, () => {
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                            }`,
                    };
                    // Modification sauce
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce image modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                });

            } else {
                const newItem = req.body;
                newItem.imageUrl = oldUrl;
                Sauce.updateOne(
                    { _id: req.params.id, userId: req.body.userId },
                    { ...newItem, imageUrl: oldUrl, _id: req.params.id }
                )
                    .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};


/* Controleur suppression sauce */
exports.deleteSauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Empêcher que n'importe quel utilisateur supprime une sauce
            if (!sauce) {
                res.status(404).json({
                    error: new Error('Non-autorisé !')
                });
            }
            // Extraction du nom du fichier à supprimer
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                // Suppression sauce
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch((error) => res.status(500).json({ error }));
};

/* Controleur recuperation all sauces */
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};


exports.likeDislikeSauce = (req, res, next) => {
    console.log(req.body)
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            /* like d'une sauce */
            // si userliked n'est pas présent dans le body de userId et que le like dans le body n'est pas strictement = à 1
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce liked !' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* unlike d'une sauce */
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce unliked ' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* disliked d'une sauce */
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce dislike ' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* retrait du disliked d'une sauce */
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'change my mind ' }))
                    .catch(error => res.status(400).json({ error }));
            }

        })
}