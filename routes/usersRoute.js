const express = require("express");
const router = express.Router();
const controllers = require("../controllers/usersControllers/usersController");

router.route("/registro").post(controllers.registerUser);
router.route("/verification/:id").post(controllers.verifyUserRegistration);
router
	.route("/oauth/login")
	.post(controllers.verifyCredentials, controllers.loginUser);
router.route("/oauth/logout").post(controllers.logOut);
router
	.route("/oauth/forgotPassword")
	.post(controllers.passwordReset)
	.patch(controllers.changePassword);
router
	.route("/oauth/forgotPassword/:token")
	.post(controllers.verifyPasswordAuthLink);
module.exports = router;
