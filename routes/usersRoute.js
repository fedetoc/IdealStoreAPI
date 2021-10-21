const express = require("express");
const router = express.Router();
const controllers = require("../controllers/usersController");

router.route("/registro").post(controllers.registrarUsuario);
router.route("/verification/:id").post(controllers.verificarUsuario);
router
	.route("/oauth/login")
	.post(controllers.verifYRegistraCredenciales, controllers.loguearUsuario);
router.route("/oauth/logout").post(controllers.logOut);
router
	.route("/oauth/forgotPassword")
	.post(controllers.passwordReset)
	.patch(controllers.changePassword);
router
	.route("/oauth/forgotPassword/:token")
	.post(controllers.verifyPasswordAuthLink);
module.exports = router;
