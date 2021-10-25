exports.catchAsync = function (fn) {
	return (req, resp, next) => fn(req, resp, next).catch(err => next(err));
};

exports.catchAsyncSimple = function (fn) {
	return (...params) => {
		try {
			fn(...params);
		} catch (err) {
			throw err;
		}
	};
};

exports.calcSkippedDocs = function (page) {
	return page === "1" ? 0 : 20 * page - 1;
};

exports.arrayToObject = function (arr) {
	return Object.fromEntries(arr);
};
