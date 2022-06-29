/* Import des modules necessaires */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


/* Schema User */
const ModelUser = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

/* Verification email unique */
ModelUser.plugin(uniqueValidator);

module.exports = mongoose.model("User", ModelUser);
