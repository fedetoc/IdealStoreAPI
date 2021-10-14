const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Usuarios } = require("../models/users");
const { catchAsync } = require("../utils");
const { Errors } = require("../error handler/errorClasses");
const { decrypt } = require("../encryption/encryption-module");
const Email = require("../mails service/mailHandler");

exports.registrarUsuario = catchAsync(async function (req, resp, next) {
	await verifyIfUserExist({ email: req.body.email }, true);
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

exports.verifYRegistraCredenciales = catchAsync(async function (
	req,
	resp,
	next
) {
	const { user, password } = req.body;
	if (user && password) {
		const regexEmail = /(?=.*@)(?=.*@[a-z]*\.com(\.[a-z]{2,3})?$)/;
		const searchParam = regexEmail.test(user)
			? { email: user }
			: { name: user };
		const errIfUserDoesntExist = new Errors.UnauthorizedUserError(req.body);
		resp.locals.userData = await verifyIfUserExist(
			searchParam,
			false,
			errIfUserDoesntExist,
			true
		);
		return next();
	}
	next(new Errors.UnauthorizedUserError(req.body));
});

exports.loguearUsuario = catchAsync(async function (req, resp, next) {
	const { userData } = resp.locals;
	const { password: passwordProvided } = req.body;
	const decripted = await decrypt(userData.password);
	if (decripted === passwordProvided) {
		const tokenSuccessResp = function (token) {
			sendUserResponse(
				resp
					.set({ "Authorization": "Bearer " + token })
					.cookie("token", token, {
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
	next(new Errors.UnauthorizedUserError(req.body));
});

exports.verificarUsuario = catchAsync(async function (req, resp, next) {
	const { id } = req.params;
	const docToValidate = await verifyIfUserExist(
		id,
		false,
		new Errors.UserNotFound(id)
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
		return next(new Errors.VerificationFailed(email, "Time expired", created));
	} else {
		await Usuarios.findByIdAndUpdate(req.params.id, { verified: true });
		sendUserResponse(resp, 200, email, "Verified Successfully");
	}
});

exports.verifyLogin = catchAsync(async function (req, resp, next) {
	const { token } = req.cookies;
	if (!token) return next(new Errors.ForbiddenPath());
	const decoded = await jwt.verify(token, process.env.JWT_KEY);
	resp.locals.userId = mongoose.Types.ObjectId(decoded.userId);
});

exports.logOut = function (req, resp, next) {
	if (req.cookies.token) resp.clearCookie("token");
	sendUserResponse(resp, 200, "Not available", "Logout successful");
};

const verifyIfUserExist = async function (
	searchObjOrId,
	errIfExistBool,
	errorObj,
	requirePassword = false
) {
	if (typeof searchObjOrId === "string")
		docFound = await Usuarios.findById(searchObjOrId);
	else {
		docFound = await Usuarios.findOne(
			searchObjOrId,
			requirePassword && "+password"
		);
	}
	const defaultErr = errIfExistBool
		? new Errors.UserAlreadyExist(docfound ? docFound.email : undefined)
		: new Errors.UserNotFound();
	const docExist = docFound ? true : false;
	if (docExist === errIfExistBool) throw errorObj || defaultErr;
	return !errIfExistBool && docFound;
};

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
					: new Errors.AppError(
							"Hubo un error en el login. Por favor intente loguearse mas tarde",
							"Login Error",
							401
					  );
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
