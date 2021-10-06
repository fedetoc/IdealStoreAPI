const { Errors } = require("./errorClasses");
const { arrayToObject } = require("../utils");

exports.errorHandle = function (err, resp) {
	let formatedErr;
	if (err.name === "ValidationError") formatedErr = handleValidationErr(err);
	formatedErr =
		formatedErr || new Errors.AppError("Ocurrio un error inesperado");
	sendErrorResponse(formatedErr, resp);
};

const handleValidationErr = function (err) {
	const badFields = Object.keys(err.errors);
	const intendedVals = [];
	const iterateFieldsRetMessageObj = badFields.map(el => {
		const validatorObj = err.errors[el];
		validatorObj.kind === "enum" && intendedVals.push([el, validatorObj.value]);
		return [el, validatorObj.message];
	});
	return new Errors.ValidationError(
		arrayToObject(iterateFieldsRetMessageObj),
		badFields,
		arrayToObject(intendedVals)
	);
};

const sendErrorResponse = function (formatedErr, resp) {
	const { code, message } = formatedErr;
	console.log(formatedErr.trace);
	if (process.env.NODE_ENV === "production") delete formatedErr.trace;
	resp.status(code).json({
		status: code,
		message: message,
		details: formatedErr,
	});
};
