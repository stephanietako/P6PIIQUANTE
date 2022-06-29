const sauces = require("../models/Sauce");

exports.getAllSauces = (req, res, next) => {
    //console.log(req.body);
    //res.send("toutes les sauces !")
    sauces.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));

};


exports.getCreateSauce = (req, res, next) => {
    res.send("créer sa sauce !")
};
