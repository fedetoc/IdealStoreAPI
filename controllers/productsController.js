const mongoose = require("mongoose");
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

exports.modifyProduct = catchAsync(async function (req, resp, next) {
	const { price, description, name } = req.body;
	const prodId = mongoose.Types.ObjectId(req.params.id);
	const docModified = await Productos.findOneAndUpdate(
		{ _id: prodId, postedBy: resp.locals.userId },
		{ price, description, name },
		{ new: true, projection: "-likes -postedBy -_id" }
	);
	if (!docModified) return next(new Errors.ProductNotFound(prodId));
	sendOkResponse(resp, docModified);
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

exports.getUserPublishedProducts = catchAsync(async function (req, resp, next) {
	const { userId } = resp.locals;
	const userProducts = await Productos.find(
		{ postedBy: userId },
		"-likes -_id"
	);
	sendOkResponse(resp, userProducts);
});

const sendOkResponse = function (respObj, data, statusCode = 200, msg = "OK") {
	respObj.status(statusCode).json({ status: statusCode, message: msg, data });
};
