const express = require("express");
const router = express.Router();
const controller = require("../controllers/productsController");
const { verifyLogin } = require("../controllers/usersController");

router.route("/").get(controller.getAllProducts);
router
	.route("/:id")
	.get(controller.getProductById)
	///////////////Protected Routes /////////////////////
	.patch(verifyLogin, controller.modifyProduct);
router.use(verifyLogin);
router.route("/").post(controller.postAProduct);
router
	.route("/likes/:id")
	.get(controller.getPeopleWhoLiked)
	.patch(controller.likeProduct);
module.exports = router;
