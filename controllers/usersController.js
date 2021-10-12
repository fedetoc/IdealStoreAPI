const jwt = require("jsonwebtoken");
const { Usuarios } = require("../models/users");
const { catchAsync } = require("../utils");
const { Errors } = require("../error handler/errorClasses");
const { decrypt } = require("../encryption/encryption-module");
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

exports.verifYRegistraCredenciales = function (req, resp, next) {
	const { user, password } = req.body;
	if (user && password) {
		const regexEmail = /(?=.*@)(?=.*@[a-z]*\.com(\.[a-z]{2,3})?$)/;
		resp.locals = {
			search: regexEmail.test(user) ? { email: user } : { name: user },
			credentials: req.body,
		};
		return next();
	}
	next(new Errors.UnauthorizedUserError(req.body));
};

exports.loguearUsuario = catchAsync(async function (req, resp, next) {
	const { credentials, userData } = resp.locals;
	const decripted = await decrypt(userData.password);
	if (decripted === credentials.password) {
		const tokenSuccessResp = function (token) {
			sendUserResponse(
				resp.set({ "Authorization": "Bearer " + token }).cookie("token", token, {
					httpOnly: true,
					secure: req.secure || req.headers["x-forwarded-proto"] === "https",
				}),
				200,
				userData.email,
				"Successfully logged in"
			);
		};
		return signToken(userData._id, tokenSuccessResp);
	}
	next(new Errors.UnauthorizedUserError(credentials));
});

exports.verifyIfUserExist = catchAsync(async function (req, resp, next) {
	const userMail = req.body.email;
	const docFound = await Usuarios.findOne({ email: userMail });
	if (docFound) next(new Errors.UserAlreadyExist(userMail));
});

exports.verifyIfUserDoesntExist = catchAsync(async function (req, resp, next) {
	const userId = req.params.id;
	const { search, credentials } = resp.locals;
	let docFound;
	if (userId) docFound = await Usuarios.findById(userId);
	else {
		docFound = await Usuarios.findOne(search, "+password");
	}
	if (!docFound) {
		const err = credentials
			? new Errors.UnauthorizedUserError(credentials)
			: new Errors.UserNotFound();
		return next(err);
	} else resp.locals.userData = docFound;
});

exports.verificarUsuario = catchAsync(async function (req, resp, next) {
	const docToValidate = resp.locals.userData;
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
		return next(new Errors.VerificationFailed(email, "Time expired", created));
	} else {
		await Usuarios.findByIdAndUpdate(req.params.id, { verified: true });
		sendUserResponse(resp, 200, email, "Verified Successfully");
	}
});

exports.verifyLogin = catchAsync(async function (req, resp, next){
	const {token} = req.cookies;
	if (!token) return next(new Errors.ForbiddenPath());
	const decoded = await jwt.verify(token, process.env.JWT_KEY);
	resp.locals.userId = decoded.userId;
});

exports.logOut = function(req, resp, next) {
	if (req.cookies.token) resp.clearCookie("token");
	sendUserResponse(resp, 200, "Not available", "Logout successful")	
}

const signToken = function (userId, fnToken) {
	const { JWT_EXP_TIME, JWT_KEY } = process.env;
	const jwtPayload = {
		userId,
		exp: Date.now() + JWT_EXP_TIME * 60 * 1000,
	};
	jwt.sign(jwtPayload, JWT_KEY, (err, token) => {
		if (err) {
			const formatedErr =
				err.name === "TokenExpiredError"
					? new Errors.ExpiredLogin(userId, new Date(err.expiredAt))
					: new Errors.AppError("Hubo un error en el login. Por favor intente loguearse mas tarde", "Login Error", 401);
			return next(formatedErr);
		}
		fnToken(token);
	});
};
const sendUserResponse = function (resp, code, user, msg) {
	resp.status(code).json({
		code,
		user,
		message: msg,
	});
};
