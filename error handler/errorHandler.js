const { Errors } = require("./errorClasses");
const { arrayToObject } = require("../utils");

exports.errorHandle = function (err, resp) {
	let formatedErr;
	if (err.name === "ValidationError") formatedErr = handleValidationErr(err);
	if (err instanceof Errors.UserAlreadyExist) formatedErr = err;
	formatedErr =
		formatedErr || new Errors.AppError("Ocurrio un error inesperado");
	sendErrorResponse(err, formatedErr, resp);
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

const sendErrorResponse = function (originalErr, formatedErr, resp) {
	const { code, message } = formatedErr;
	const prod = process.env.NODE_ENV === "production";
	prod && delete formatedErr.trace;
	resp.status(code).json({
		status: code,
		message: message,
		details: !prod && code === 500 ? originalErr : formatedErr,
	});
};
