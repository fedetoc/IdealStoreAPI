const { Usuarios } = require("../models/users");
const { catchAsync } = require("../utils");
const { Errors } = require("../error handler/errorClasses");
const Email = require("../mails service/mailHandler");

exports.registrarUsuario = catchAsync(async function (req, resp, next) {
	delete req.body.verified;
	const userDoc = new Usuarios(req.body);
	userDoc.isNew = true;
	const verificationUrl = `http://${req.hostname}${
		":" + process.env.PORT
	}/usuarios/verification/${userDoc.id}?_method=PATCH`;
	await userDoc.save();
	await new Email(userDoc.email).sendWelcomeEmail(
		userDoc.name,
		verificationUrl
	);
	sendUserResponse(
		resp,
		201,
		req.body.email,
		"Operacion Exitosa! Por favor verifique su cuenta con el correo que le hemos enviado"
	);
});

exports.verifyIfUserExist = catchAsync(async function (req, resp, next) {
	const userMail = req.body.email;
	const docFound = await Usuarios.findOne({ email: userMail });
	if (docFound) next(new Errors.UserAlreadyExist(userMail));
});

exports.verifyIfUserDoesntExist = catchAsync(async function (req, resp, next) {
	const userId = req.params.id;
	const docFound = await Usuarios.findById(userId);
	if (!docFound) next(new Errors.UserNotFound(userId));
	else resp.locals.userData = docFound;
});

exports.verificarUsuario = catchAsync(async function (req, resp, next) {
	const docToValidate = resp.locals.userData;
	const { email, created } = docToValidate;
	const timeLimit =
		new Date(created).getTime() +
		1000 * 60 * process.env.USER_VERIFICATION_TIMEMINS;
	if (timeLimit < Date.now()) {
		await Usuarios.findOneAndDelete(docToValidate);
		return next(new Errors.VerificationFailed(email, "Time expired", created));
	} else {
		await Usuarios.findByIdAndUpdate(req.params.id, { verified: true });
		sendUserResponse(resp, 200, email, "Verified Successfully");
	}
});

const sendUserResponse = function (resp, code, user, msg) {
	resp.status(code).json({
		code,
		user,
		message: msg,
	});
};
