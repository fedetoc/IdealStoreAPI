const mongoose = require("mongoose");
const { app } = require("./app");
const dbCredentials = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
};

const port = process.env.PORT || 3000;

const connectionString = process.env.DBCONNECTION.replace(
	/\-(USER|PASSWORD)\-/g,
	(_, p1) => dbCredentials[p1.toLowerCase()]
);

mongoose
	.connect(connectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB Connection Successfull"))
	.catch(err => {
		console.log(
			"There was an error connecting to DB: ",
			err.message || err.reason,
			"Server will shut down"
		);
		throw err;
	});

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

process.on("uncaughtException", err => {
	console.log("An unexpected error ocurred!. Shutting down...");
	console.log(err.name, err.message);
	process.exit(1);
});

process.on("unhandledRejection", err => {
	console.log("An error ocurred! Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
