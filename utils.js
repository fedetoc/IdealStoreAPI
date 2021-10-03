exports.catchAsync = function (fn) {
	return (req, resp, next) =>
		fn(req, resp, next)
			.then(() => next())
			.catch(err => next(err));
};

exports.calcSkippedDocs = function (page) {
	return page === "1" ? 0 : 20 * page - 1;
};
