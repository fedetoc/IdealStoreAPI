const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const productRouter = require("./productsRoute");

app.use("/productos", productRouter);

app.use("/*", (req, resp, _) => {
	const stat = 404;
	resp.status(stat).json({
		status: "Not Found",
		code: stat,
		message: `El dominio ${req.originalUrl} no existe o esta en construccion.`,
	});
});

exports.app = app;
