class AppError extends Error {
	constructor(message, type = "Unknown Error", code = 500) {
		super(message);
		this.message = message;
		this.code = code;
		this.type = type;
		this.trace = Error.captureStackTrace(this, AppError);
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
		super("Invalid username or password", "Forbidden Error", 403);
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

module.exports.Errors = {
	AppError,
	ValidationError,
	UnauthorizedUserError,
	UserAlreadyExist,
	RegistroError,
};
