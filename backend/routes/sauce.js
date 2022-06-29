/* Import des modules necessaires */
const express = require("express");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce");

/* Routage User */
router.get("/", sauceCtrl.getAllSauces);
router.post("/", sauceCtrl.getCreateSauce);



module.exports = router;
