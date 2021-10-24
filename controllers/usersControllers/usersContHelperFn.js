const jwt = require("jsonwebtoken");
const Email = require("../../mails service/mailHandler");
const { Usuarios } = require("../../models/users");
const {
	ForbiddenPath,
	VerificationFailed,
	ExpiredLogin,
	AppError,
	UserNotFound,
	UserAlreadyExist,
} = require("../../error handler/errorClasses").Errors;
const { encryptWithSha } = require("../../encryption/encryption-module");

const validatePassCookie = async function (cookieToken, linkToken) {
	if (!cookieToken) throw new ForbiddenPath();
	if (linkToken && (await encryptWithSha(cookieToken)) !== linkToken)
		throw new VerificationFailed("Not available", "Verification didn't pass");
	return cookieToken.split(":")[0];
};

const sendEmail = async function (
	req,
	param,
	destinationEmail,
	usernameIfWelcomeEmail
) {
	const serviceRoute = usernameIfWelcomeEmail
		? "verification"
		: "forgotPassword";
	const linkToSend = `http://${req.hostname}:${process.env.PORT}/usuarios/oauth/${serviceRoute}/${param}?_method=PATCH`;
	const email = new Email(destinationEmail);
	if (usernameIfWelcomeEmail)
		await email.sendWelcomeEmail(usernameIfWelcomeEmail, linkToSend);
	else await email.sendPasswordResetEmail(linkToSend);
};

/*const sendLinkPasswordReset = async function (req, token, destinationEmail) {
	const link = `http://${req.hostname}${
		":" + process.env.PORT
	}/usuarios/oauth/forgotPassword/${token}?_method=PATCH`;
	await new Email(destinationEmail).sendPasswordResetEmail(link);
};*/

const verifyIfUserExist = async function (
	searchObjOrId,
	errIfExistBool,
	errorObj,
	requirePassword = false
) {
	let docFound;
	if (typeof searchObjOrId === "string")
		docFound = await Usuarios.findById(searchObjOrId);
	else {
		docFound = await Usuarios.findOne(
			searchObjOrId,
			requirePassword && "+password"
		);
	}
	const defaultErr = errIfExistBool
		? new UserAlreadyExist(docFound ? docFound.email : undefined)
		: new UserNotFound();
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
					? new ExpiredLogin(userId, new Date(err.expiredAt))
					: new AppError(
							"Hubo un error en el login. Por favor intente loguearse mas tarde",
							"Login Error",
							401
					  );
			return next(formatedErr);
		}
		fnToken(token);
	});
};

const verifyToken = async function (token, fn) {
	const key = process.env.JWT_KEY;
	await jwt.verify(token, key, (err, decoded) => {
		if (err) throw err;
		fn(decoded.userId);
	});
};

const cookieSettings = function (req) {
	return {
		httpOnly: true,
		secure: req.secure || req.headers["x-forwarded-proto"] === "https",
		expires: new Date(
			Date.now() +
				1000 * 60 * process.env.PASSWORD_RESET_VERIF_AND_LOGIN_TIMEMINS
		),
	};
};

module.exports = {
	validatePassCookie,
	sendEmail,
	verifyIfUserExist,
	signToken,
	verifyToken,
	cookieSettings,
};
