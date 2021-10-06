const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const productRouter = require("./productsRoute");
const { errorHandle } = require("./error handler/errorHandler");

app.use(express.json({ limit: "200kb" }));

app.use("/productos", productRouter);

app.use("/(*)", (req, resp, _) => {
	const stat = 404;
	resp.status(stat).json({
		status: "Not Found",
		code: stat,
		message: `El dominio ${req.originalUrl} no existe o esta en construccion.`,
	});
});

app.use((err, _, resp, next) => {
	errorHandle(err, resp);
});

exports.app = app;
