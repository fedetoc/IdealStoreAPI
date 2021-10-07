const express = require("express");
const router = express.Router();
const controller = require("../controllers/productsController");

router.route("/").get(controller.getAllProducts);
router.route("/:id").get(controller.getProductById);
router.route("/").post(controller.postAProduct);
module.exports = router;
