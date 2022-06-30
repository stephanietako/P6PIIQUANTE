/* Import des modules necessaires */
const Sauce = require("../models/sauce");
const fs = require("fs");
const { captureRejections } = require("events");
const sauce = require("../models/sauce");


/* Controleur creation sauce */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
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
        .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
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
            // Enregistrement ancienne imgUrl (si nouvelle image dans modif)
            const oldUrl = sauce.imageUrl;
            // Recuperation nom de l'image
            const filename = sauce.imageUrl.split("/images/")[1];
            // Suppression IMG dans le dossier local
            if (req.file) {
                fs.unlink(`images/${filename}`, () => {
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                            }`,
                    };
                    // MAJ de la sauce avec données modifiées
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                });
                //   Sauce.updateOne(
                //     { _id: req.params.id, userId: req.body.userId },
                //     { ...sauceObject, _id: req.params.id }
                //   )
                //     .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                //     .catch((error) => res.status(400).json({ error }));
                // });
                // Modification sauce sans modif img
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
            // Empêcher n'importe qu'elle utilisateur de delete une sauce
            if (!sauce) {
                res.status(404).json({
                    error: new Error('No such Sauce!')
                });
            }
            // Extraction du nom du fichier à supprimer
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                // Suppression sauce
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
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
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce liked !' }))
                    .catch(error => res.status(400).json({ error }));
            }


            /*unlike d'une sauce */
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce unliked ' }))
                    .catch(error => res.status(400).json({ error }));
            }

        })


}