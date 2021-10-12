const { Productos } = require("../models/products");
const { catchAsync, calcSkippedDocs } = require("../utils");
exports.getAllProducts = catchAsync(async function (req, resp, next) {
	let query = Productos.find({}, "-code -description").sort("-likes");
	const page = req.query.page;
	if (page > 0) query = query.skip(calcSkippedDocs(page)).limit(20);
	sendOkResponse(resp, await query);
});

exports.getProductById = catchAsync(async function (req, resp, next) {
	const docs = await Productos.findById(req.params.id);
	sendOkResponse(resp, docs);
});

exports.postAProduct = catchAsync(async function (req, resp, next) {
	const newProduct = new Productos(req.body);
	console.log(req.body);
	await newProduct.save();
	sendOkResponse(resp, {}, 201, "Created");
});

const sendOkResponse = function (respObj, data, statusCode = 200, msg = "OK") {
	respObj.status(statusCode).json({ status: statusCode, message: msg, data });
};
