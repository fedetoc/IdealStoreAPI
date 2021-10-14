const { Errors } = require("../error handler/errorClasses");
const { Productos } = require("../models/products");
const { catchAsync, calcSkippedDocs } = require("../utils");
exports.getAllProducts = catchAsync(async function (req, resp, next) {
	let query = Productos.find({}, "-code -description")
		.sort("-likes")
		.populate("likes", "name")
		.populate("postedBy", "name");
	const page = req.query.page;
	if (page > 0) query = query.skip(calcSkippedDocs(page)).limit(20);
	sendOkResponse(resp, await query);
});

exports.getProductById = catchAsync(async function (req, resp, next) {
	const docs = await Productos.findById(req.params.id);
	sendOkResponse(resp, docs);
});

exports.postAProduct = catchAsync(async function (req, resp, next) {
	const productData = { ...req.body, postedBy: resp.locals.userId };
	const newProduct = new Productos(productData);
	await newProduct.save();
	sendOkResponse(resp, {}, 201, "Created");
});

exports.likeProduct = catchAsync(async function (req, resp, next) {
	const productId = req.params.id;
	await Productos.findByIdAndUpdate(productId, {
		$addToSet: { likes: resp.locals.userId },
	});
	sendOkResponse(resp, { productId });
});

exports.getPeopleWhoLiked = catchAsync(async function (req, resp, next) {
	const productId = req.params.id;
	const product = await Productos.findById(productId, "-code -description")
		.populate("likes", "name")
		.populate("postedBy", "name");
	sendOkResponse(resp, product);
});

const sendOkResponse = function (respObj, data, statusCode = 200, msg = "OK") {
	respObj.status(statusCode).json({ status: statusCode, message: msg, data });
};
