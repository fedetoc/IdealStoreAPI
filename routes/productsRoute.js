const express = require("express");
const router = express.Router();
const controller = require("../controllers/productsController");
const {
	verifyLogin,
} = require("../controllers/usersControllers/usersController");

const idMongoRouteParam = "/:id([0-9a-z]{24})";
const generalRoute = router.route("/$");

generalRoute
	.get(controller.getAllProducts)
	.post(verifyLogin, controller.postAProduct);
router
	.route(idMongoRouteParam)
	.get(controller.getProductById)
	///////////////Protected Routes /////////////////////
	.patch(verifyLogin, controller.modifyProduct);
router
	.route("/likes" + idMongoRouteParam)
	.get(verifyLogin, controller.getPeopleWhoLiked)
	.patch(verifyLogin, controller.likeProduct);
router
	.route("/misProductos")
	.get(verifyLogin, controller.getUserPublishedProducts);
module.exports = router;
