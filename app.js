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

app.use("/productos", productRouter);
app.use("/usuarios", userRouter);

app.all("/", (req, resp, _) => {
	const stat = 404;
	resp.status(stat).json({
		status: "Not Found",
		code: stat,
		message: `El dominio ${req.originalUrl} no existe o esta en construccion.`,
	});
});

app.use((err, _, resp, __) => {
	errorHandle(err, resp);
});
exports.app = app;
