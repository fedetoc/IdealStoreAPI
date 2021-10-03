const { ObjectID } = require("bson");
const mongoose = require("mongoose");

const productosSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "El nombre del producto es requerido"],
	},
	price: {
		type: Number,
		required: [true, "El precio del producto es requerido"],
		min: [0, "El precio no puede ser negativo"],
	},
	code: {
		type: Number,
		unique: true,
	},
	description: {
		type: String,
		required: [true, "Por favor agregue una descripcion del producto"],
		maxLength: [30, "El numero maximo de caracteres es 30"],
	},
	category: {
		type: String,
		required: [true, "La categoria es requerida"],
		enum: ["Tecnología", "Ropa", "Hogar", "Accesorios"],
	},
	likes: {
		type: [ObjectID],
	},
});

exports.Productos = mongoose.model("Productos", productosSchema);
