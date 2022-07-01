/* Import des modules necessaires */
const Sauce = require("../models/sauce");
// fs package de Node signifie file system (système de fichiers) 
//  fs nous donne accès aux fonctions qui nous permettent de modifier le système de fichier également aux fonctions permettant de supprimer les fichiers
const fs = require("fs");
//const { captureRejections } = require("events");
//const sauce = require("../models/sauce");

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
        // Initialisation valeur like-dislike 0
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
                    // MAJ de la sauce avec données modifiées
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce image modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                });

            } else {
                const newItem = req.body;
                newItem.imageUrl = oldUrl;
                // MAJ de la sauce avec données modifiées
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
            // si userliked est présent dans le body de userId et que le like dans le body n'est pas strictement = à 1
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                // alors j'incrémente en valeur positive de 1 et je pousse dans le body du userId
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce liked !' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* unlike d'une sauce */
            // si userliked est présent dans le body de userId et que le like dans le body est strictement = à 0 (sa valeur de base)
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                // alors j'incrémente en valeur négative de 1(donc en fait je décremente) et je pousse dans le body du userId
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce unliked ' }))
                    .catch(error => res.status(400).json({ error }));
            }


            /* disliked d'une sauce */
            // si userDisliked est présent dans le body de userId et que le like dans le body n'est pas strictement = à -1 
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                // la valeur de base est initialisée à 0 et la valeur d'un dislike c'est -1 du coup  pour que le user dislike au final il faut incrementer de 1 pour ajouter le vote du user 
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce dislike ' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* retrait du disliked d'une sauce */
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                // si ma sauce est égale à 0 car demarre 0 et je change d avis j'incrémente de 1 en valeur negative et je pull
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'change my mind ' }))
                    .catch(error => res.status(400).json({ error }));
            }


        })

}