const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const productRouter = require("./routes/productsRoute");
const userRouter = require("./routes/usersRoute");
const { errorHandle } = require("./error handler/errorHandler");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const xss = require("xss-clean");
const compression = require("compression");
const { Errors } = require("./error handler/errorClasses");

const limiter = rateLimit({
	max: process.env.RATE_LIMIT_REQUESTS,
	windowMs: process.env.RATE_LIMIT * 60 * 1000,
	message: new Errors.RateLimitExceeded(process.env.RATE_LIMIT),
});
app.use(limiter);
app.use(express.json({ limit: "200kb" }));
app.use(helmet());
app.use(cookieParser());
app.use(hpp());
app.use(compression());
app.use(xss());

app.use("/$", (req, resp, _) => {
	resp.status(200).json({
		status: "OK",
		code: 200,
		message: "Bienvenido a Ideal Store API!",
	});
});
app.use("/productos", productRouter);
app.use("/usuarios", userRouter);

app.all("*", (req, resp, next) => {
	return next(
		new Errors.AppError(
			`El dominio ${req.originalUrl} no existe o esta en construccion.`,
			"Not Found",
			404
		)
	);
});

app.use((err, _, resp, __) => {
	errorHandle(err, resp);
});
exports.app = app;
