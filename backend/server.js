/* Import des modules necessaires */
const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ encoding: "latin1" });

/* Connection BDD mongoose */
mongoose
    .connect(process.env.DBCONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    // Demarrage serveur
    .then(() =>
        app.listen(process.env.SERVER_PORT, () => {
            console.log(
                `This server is running on port ${process.env.SERVER_PORT}. Enjoy !`
            );
        })
    )
    // Arret du serveur si connection impossible
    .catch(() => console.log("Server connection failed !"));
