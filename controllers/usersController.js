const { Usuarios } = require("../models/users");
const { catchAsync } = require("../utils");
const { Errors } = require("../error handler/errorClasses");

exports.registrarUsuario = catchAsync(async function (req, resp, next) {
	const userDoc = new Usuarios(req.body);
	userDoc.isNew = true;
	await userDoc.save();
	sendUserResponse(resp, 201, req.body.email, "Registro Exitoso");
});

exports.verifyIfUserExist = catchAsync(async function (req, resp, next) {
	const userMail = req.body.email;
	const docFound = await Usuarios.findOne({ email: userMail });
	if (docFound) next(new Errors.UserAlreadyExist(userMail));
});

const sendUserResponse = function (resp, code, user, msg) {
	resp.status(code).json({
		code,
		user,
		message: msg,
	});
};
