const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const productRouter = require("./routes/productsRoute");
const userRouter = require("./routes/usersRoute");
const { errorHandle } = require("./error handler/errorHandler");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

app.use(express.json({ limit: "200kb" }));
app.use(helmet());
app.use(cookieParser())
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
