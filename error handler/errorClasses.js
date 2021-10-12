class AppError extends Error {
	constructor(message, type = "Unknown Error", code = 500) {
		super(message);
		this.message = message;
		this.code = code;
		this.type = type;
		Error.captureStackTrace(this, this.constructor);
	}
}

class ValidationError extends AppError {
	constructor(msgs, invalidField, intendedVal) {
		super(msgs, "Validation Error", 400);
		this.badFields = invalidField;
		this.cantErrors = this.badFields.length;
		if (intendedVal) this.intended = intendedVal;
	}
}

class UnauthorizedUserError extends AppError {
	constructor(credentials) {
		super("Invalid username or password", "Forbidden Error", 401);
		this.credentialsProvided = credentials;
	}
}

class RegistroError extends AppError {
	constructor(badData, message) {
		super(message, "Registro Error", 400);
		this.badData = badData;
	}
}

class UserAlreadyExist extends AppError {
	constructor(email) {
		super(
			`Ya existe un usuario registrado con el mail ${email}`,
			"Error de registro",
			401
		),
			(this.emailInserted = email);
	}
}

class MailError extends AppError {
	constructor(type, emailTo, intendedMailType, errorDetail) {
		const msg =
			type === "SMTP Server Connection"
				? "Hubo un error al intentar conectar con el servidor, por lo que no se pudo enviar el mail"
				: `Hubo un error al intentar enviar un mail a ${emailTo}`;
		super(msg, type, 503);
		(this.recipient = emailTo),
			(this.intendedOperation = intendedMailType),
			(this.errorDetail =
				process.env.NODE_ENV === "development" && errorDetail);
	}
}

class VerificationFailed extends AppError {
	constructor(user, reason, signInDate) {
		const msg =
			reason === "Time expired"
				? `No fue posible verificar el usuario, expiro el periodo de ${process.env.USER_VERIFICATION_TIMEMINS} minutos. Por favor registrese nuevamente`
				: "Hubo un error al verificar al usuaio. Intente nuevamente";
		super(msg, "Verification Failed", 401);
		(this.user = user), (this.signInDate = signInDate);
	}
}

class UserNotFound extends AppError {
	constructor(intendedUser = "Not available") {
		super("El usuario consultado no se encuentra en la BBDD", "Not found", 404);
		this.userNotFound = intendedUser;
	}
}

class ForbiddenPath extends AppError {
	constructor() {
		super("Esta intentado ingresar a una ruta protegida. Por favor logueese", "Ruta Protegida", 403)
	}
}

class ExpiredLogin extends AppError {
	constructor(user, expiredAt) {
		super("Su sesion ha expirado. Por favor registrese nuevamente", "Login Expired", 401);
		this.user = user;
		this.expiredAt = expiredAt
	}
}

/*class LoginError extends AppError {
	constructor(errorMsg, user) {
		super(errorMsg, "Login Failed", 403);
		this.rejectedUser = user;
	}
}*/

module.exports.Errors = {
	AppError,
	ValidationError,
	UnauthorizedUserError,
	UserAlreadyExist,
	RegistroError,
	MailError,
	VerificationFailed,
	UserNotFound,
	ForbiddenPath,
	ExpiredLogin
};
