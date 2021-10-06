const express = require("express");
const router = express.Router();
const controllers = require("./productsController");

router.route("/").get(controllers.getAllProducts);
router.route("/:id").get(controllers.getProductById);
router.route("/").post(controllers.postAProduct);
module.exports = router;
