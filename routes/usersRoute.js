const express = require("express");
const router = express.Router();
const controllers = require("../controllers/usersController");

router.use(controllers.verifyIfUserExist);
router.route("/registro").post(controllers.registrarUsuario);
router
	.route("/verification/:id")
	.post(controllers.verifyIfUserDoesntExist, controllers.verificarUsuario);

module.exports = router;
