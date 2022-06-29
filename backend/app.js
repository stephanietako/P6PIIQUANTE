/* Import des modules necessaires */
const express = require("express");
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");
// path est le module utilitaire natif de Node.js.
// Le path module fournit de nombreuses fonctionnalités très utiles pour accéder et interagir avec le système de fichiers.
const path = require("path");
/* Initialisation de l'API (donc je l'exporte) */
const app = express();

app.use(express.urlencoded({ extended: true }))

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    // on doit appeller next sinon on ne renvoie pas de réponse et la requete ne se termine pas
    next();
});

/* Securite en tete */
const helmet = require("helmet");

app.use(helmet());

/* RateLimit */
const rateLimit = require("express-rate-limit");
const { sauces } = require("./controllers/sauce");

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message:
            "Vous avez effectué plus de 100 requêtes dans une limite de 15 minutes!",
        headers: true,
    })
);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
// j'exporte la const (l'application) pour pouvoir y accéder depuis les autres fichiers de notre projet notamment notre serveur node
module.exports = app;