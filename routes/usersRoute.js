const express = require("express");
const router = express.Router();
const controllers = require("../controllers/usersController");

router.route("/registro").post(controllers.registrarUsuario);
router.route("/verification/:id").post(controllers.verificarUsuario);
router
	.route("/oauth/login")
	.post(controllers.verifYRegistraCredenciales, controllers.loguearUsuario);
router.route("/oauth/logout").post(controllers.logOut);
module.exports = router;
