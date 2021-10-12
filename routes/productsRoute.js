const express = require("express");
const router = express.Router();
const controller = require("../controllers/productsController");
const {verifyLogin} = require("../controllers/usersController")


router.route("/").get(controller.getAllProducts);
router.route("/:id").get(controller.getProductById);
router.route("/").post(verifyLogin, controller.postAProduct);
module.exports = router;
