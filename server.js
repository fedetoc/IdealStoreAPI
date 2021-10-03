const mongoose = require("mongoose");
const { app } = require("./app");
const dbCredentials = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
};

const port = process.env.PORT;

const connectionString = process.env.DBCONNECTION.replace(
	/\<(USER|PASSWORD)\>/g,
	(_, p1) => dbCredentials[p1.toLowerCase()]
);

mongoose
	.connect(connectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB Connection Successfull"))
	.catch(err =>
		console.log("Hubo un error al conectar la base de datos: " + err.reason)
	);

app.listen(port, () => console.log(`Listening on port ${port}`));
