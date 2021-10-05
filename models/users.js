const mongoose = require("mongoose");
const { encrypt } = require("../encryption/encryption-module");

const usersSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, "El username es requerido"],
		maxLength: [10, "El usuario solo puede tener hasta 10 caracteres"],
	},
	password: {
		type: String,
		required: [true, "La contrasenia es requerida"],
		minLength: [7, "La contrasenia debe contar con al menos 7 caracteres"],
		maxLength: [15, "La contrasenia puede tener hasta 15 caracteres"],
		match: [
			/(?=.*[a-z])(?=.*[A-Z])(?=.*[1-9])/,
			"La contrasenia debe tener al menos una mayuscula, una minuscula y un numero",
		],
		select: false,
	},
	name: {
		type: String,
		required: [true, "El nombre es requerido"],
	},
	dni: {
		type: String,
		minLength: [true, "DNI invalido"],
		maxLength: [true, "DNI invalido"],
		required: true,
	},
	likes: {
		type: [ObjectID],
		default: [],
	},
});

const encryptPassword = async function (next) {
	await encrypt(this.password, (err, encrypted) => {
		if (err) return next(err);
		this.password = encrypted;
		return next();
	});
};

usersSchema.pre("save", encryptPassword);
exports.Usuarios = usersSchema.model("Usuarios", usersSchema);
