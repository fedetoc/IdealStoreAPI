const express = require("express");
const router = express.Router();
const controllers = require("./productsController");

router.route("/").get(controllers.getAllProducts);
router.route("/:id").get(controllers.getProductById);

module.exports = router;
