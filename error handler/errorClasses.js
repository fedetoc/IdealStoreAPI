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

module.exports.Errors = { AppError, ValidationError, UnauthorizedUserError };
