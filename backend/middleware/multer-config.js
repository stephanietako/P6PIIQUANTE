/* Import des modules necessaires */
// multer est un package de gestion de fichiers
const multer = require("multer");

// type d'image(dictionnaire)
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        // Date.now est un timestamp
        callback(null, name + Date.now() + "." + extension);
    },
});

module.exports = multer({ storage: storage }).single("image");