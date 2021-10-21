const { Errors } = require("./errorClasses");
const { arrayToObject } = require("../utils");

exports.errorHandle = function (err, resp) {
	let formatedErr;
	if (err.name === "ValidationError") formatedErr = handleValidationErr(err);
	if (err.name === "TokenExpiredError")
		formatedErr = new Errors.ExpiredLogin(
			"Not available",
			new Date(err.expiredAt)
		);
	if (
		err instanceof Errors.UserAlreadyExist ||
		err instanceof Errors.VerificationFailed ||
		err instanceof Errors.UserNotFound ||
		err instanceof Errors.UnauthorizedUserError ||
		err instanceof Errors.ForbiddenPath ||
		err instanceof Errors.MissingData
	)
		formatedErr = err;
	if (err.name === "CastError" && err.message.includes("Productos"))
		formatedErr = new Errors.ProductNotFound(err.value);

	const isInProduction = process.env.NODE_ENV === "production";
	const defaultErr = isInProduction
		? new Errors.AppError("Ocurrio un error inesperado")
		: err;
	formatedErr = formatedErr || defaultErr;
	sendErrorResponse(formatedErr, resp, !isInProduction);
};

const handleValidationErr = function (err) {
	const badFields = Object.keys(err.errors);
	const intendedVals = [];
	const iterateFieldsRetMessageObj = badFields.map(el => {
		const validatorObj = err.errors[el];
		if (validatorObj.kind === "enum" || validatorObj.kind === "regexp")
			intendedVals.push([el, validatorObj.value]);
		return [el, validatorObj.message];
	});
	return new Errors.ValidationError(
		arrayToObject(iterateFieldsRetMessageObj),
		badFields,
		arrayToObject(intendedVals)
	);
};

const sendErrorResponse = function (formatedErr, resp, addStack = true) {
	const { code, message } = formatedErr;
	resp.status(code || 500).json({
		status: code || 500,
		message: message,
		details: formatedErr,
		stack: addStack && formatedErr.stack,
	});
};
