const { Productos } = require("./models/products");
const { catchAsync, calcSkippedDocs } = require("./utils");

exports.getAllProducts = catchAsync(async function (req, resp, next) {
	let query = Productos.find({}).sort("-likes");
	const page = req.query.page;
	if (page > 0) query = query.skip(calcSkippedDocs(page)).limit(20);
	sendOkResponse(resp, await query);
});

exports.getProductById = catchAsync(async function (req, resp, next) {
	const docs = await Productos.findById(req.params.id);
	sendOkResponse(resp, docs);
});

const sendOkResponse = function (respObj, data) {
	respObj.status(200).json({ status: 200, message: "OK", data });
};
