const mongoose = require("mongoose");
const { encrypt } = require("../encryption/encryption-module");
const { Errors } = require("../error handler/errorClasses");

const validatePasswordCoincidence = function (v) {
	return new Promise((resolve, reject) =>
		v === this.password
			? resolve(true)
			: reject(new Errors.RegistroError(v, "Las contraseñas no coinciden"))
	);
};

const encryptPassword = async function (next) {
	await encrypt(this.password, (err, encrypted) => {
		if (err) return next(err);
		this.password = encrypted;
		this.confirmPassword = null;
		return next();
	});
};

const usersSchema = mongoose.Schema({
	email: {
		type: String,
		required: [true, "El email es requerido"],
		match: [
			/(?=.*@)(?=.*@[a-z]*\.com(\.[a-z]{2,3})?$)/,
			"Email ingresado no valido",
		],
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
	confirmPassword: {
		type: String,
		required: [true, "Por favor confirme la contrasenia"],
		select: false,
		validate: validatePasswordCoincidence,
	},
	name: {
		type: String,
		required: [true, "El nombre es requerido"],
		maxLength: [20, "El usuario solo puede tener hasta 20 caracteres"],
	},
	dni: {
		type: String,
		minLength: [8, "DNI invalido"],
		maxLength: [8, "DNI invalido"],
		required: true,
	},
	likes: {
		type: [Object],
		default: [],
	},
	verified: {
		type: Boolean,
		default: false,
	},
	allowedToChangePassword: {
		type: Boolean,
		default: false,
	},
	created: {
		type: Date,
		immutable: true,
		default: Date.now(),
	},
});

usersSchema.pre("save", encryptPassword);
exports.Usuarios = mongoose.model("Usuarios", usersSchema);
