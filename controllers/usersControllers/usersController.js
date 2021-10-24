const mongoose = require("mongoose");
const { Usuarios } = require("../../models/users");
const { catchAsync } = require("../../utils");
const {
	UnauthorizedUserError,
	UserNotFound,
	VerificationFailed,
	ForbiddenPath,
	MissingData,
} = require("../../error handler/errorClasses").Errors;
const {
	validatePassCookie,
	sendEmail,
	verifyIfUserExist,
	signToken,
	verifyToken,
	cookieSettings,
} = require("./usersContHelperFn");
const {
	decrypt,
	generateRandom,
	encryptWithSha,
} = require("../../encryption/encryption-module");

exports.registerUser = catchAsync(async function (req, resp, next) {
	await verifyIfUserExist({ email: req.body.email }, true);
	delete req.body.verified;
	const userDoc = new Usuarios(req.body);
	userDoc.isNew = true;
	await userDoc.save();
	await sendEmail(req, userDoc.id, userDoc.email, userDoc.name);
	sendUserResponse(
		resp,
		201,
		req.body.email,
		"Operacion Exitosa! Por favor verifique su cuenta con el correo que le hemos enviado"
	);
});

exports.verifyCredentials = catchAsync(async function (req, resp, next) {
	const { user, password } = req.body;
	if (user && password) {
		const regexEmail = /(?=.*@)(?=.*@[a-z]*\.com(\.[a-z]{2,3})?$)/;
		const searchParam = regexEmail.test(user)
			? { email: user }
			: { name: user };
		const errIfUserDoesntExist = new UnauthorizedUserError(req.body);
		resp.locals.userData = await verifyIfUserExist(
			searchParam,
			false,
			errIfUserDoesntExist,
			true
		);
		return next();
	}
	next(new UnauthorizedUserError(req.body));
});

exports.loginUser = catchAsync(async function (req, resp, next) {
	const { userData } = resp.locals;
	const { password: passwordProvided } = req.body;
	const decripted = await decrypt(userData.password);
	if (decripted === passwordProvided) {
		const tokenSuccessResp = function (token) {
			sendUserResponse(
				resp
					.set({ "Authorization": "Bearer " + token })
					.cookie("token", token, cookieSettings(req)),
				200,
				userData.email,
				"Successfully logged in"
			);
		};
		return signToken(userData._id, tokenSuccessResp);
	}
	next(new UnauthorizedUserError(req.body));
});

exports.verifyUserRegistration = catchAsync(async function (req, resp, next) {
	const { id } = req.params;
	const docToValidate = await verifyIfUserExist(
		id,
		false,
		new UserNotFound(id)
	);
	const { email, created, verified } = docToValidate;
	if (verified)
		return sendUserResponse(
			resp,
			200,
			email,
			"This user has already completed verification"
		);
	const timeLimit =
		new Date(created).getTime() +
		1000 * 60 * process.env.USER_VERIFICATION_TIMEMINS;
	if (timeLimit < Date.now()) {
		await Usuarios.findOneAndDelete(docToValidate);
		return next(new VerificationFailed(email, "Time expired", created));
	} else {
		await Usuarios.findByIdAndUpdate(req.params.id, { verified: true });
		sendUserResponse(resp, 200, email, "Verified Successfully");
	}
});

exports.verifyLogin = catchAsync(async function (req, resp, next) {
	const { token } = req.cookies;
	if (!token) return next(new ForbiddenPath());
	await verifyToken(token, userId => {
		resp.locals.userId = mongoose.Types.ObjectId(userId);
	});
});

exports.logOut = function (req, resp, next) {
	if (req.cookies.token) resp.clearCookie("token");
	sendUserResponse(resp, 200, "Not available", "Logout successful");
};

exports.passwordReset = catchAsync(async function (req, resp, next) {
	const { email } = req.query;
	const findUser = await Usuarios.findOne({ email });
	const idUser = findUser ? findUser.id : generateRandom(12.5);
	const token = idUser + ":" + generateRandom(127);
	const encryptedToken = await encryptWithSha(token);
	findUser && (await sendEmail(req, encryptedToken, email));
	sendUserResponse(
		resp.cookie("passToken", token, cookieSettings(req)),
		200,
		email,
		"En caso que el email provisto corresponda a un usuario registrado, recibira un email conteniendo el link para resetear la contraseña"
	);
});

exports.verifyPasswordAuthLink = catchAsync(async function (req, resp, next) {
	const { token } = req.params;
	const { passToken: cookieToken } = req.cookies;
	const userId = await validatePassCookie(cookieToken, token);
	const user = await Usuarios.findByIdAndUpdate(
		userId,
		{ allowedToChangePassword: true },
		{ select: "email" }
	);
	sendUserResponse(
		resp,
		200,
		user.email,
		"La verificacion ha concluido satisfactoriamente. Por favor cambie su contraseña"
	);
});

exports.changePassword = catchAsync(async function (req, resp, next) {
	const userId = await validatePassCookie(req.cookies.passToken);
	const { password, confirmPassword } = req.body;
	if (!password || !confirmPassword)
		return next(new MissingData(["password", "confirmPassword"]));
	const userDoc = await verifyIfUserExist(userId, false);
	if (!userDoc.allowedToChangePassword)
		return next(new VerificationFailed(userDoc.email));
	const docUpdate = {
		password,
		confirmPassword,
		allowedToChangePassword: false,
		isNew: false,
	};
	Object.assign(userDoc, docUpdate);
	await userDoc.save({ validateModifiedOnly: true });
	resp.clearCookie("passToken");
	sendUserResponse(
		resp,
		200,
		userDoc.email,
		"Password reset completed. You may login again"
	);
});

const sendUserResponse = function (resp, code, user, msg) {
	resp.status(code).json({
		code,
		user,
		message: msg,
	});
};
