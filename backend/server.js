const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ encoding: "latin1" });
console.log("SALUT");


// const server = http.createServer((req, res) => {
//     res.end('Voilà la réponse du serveur !');
// });

// server.listen(process.env.PORT || 3000);


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

