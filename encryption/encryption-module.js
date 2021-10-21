const {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	createHmac,
} = require("crypto");
const { promisify } = require("util");
const secret = process.env.ENCRYPT_SECRET;
const shasecret = process.env.SHA_ENCRYPT_SECRET;
const algorythm = process.env.ENCRYPT_ALGORYTHM;

const encryption = function (toBeEncrypted, fn) {
	const iv = randomBytes(16);
	const cipher = createCipheriv(algorythm, Buffer.from(secret, "hex"), iv);
	let encrypted = cipher.update(toBeEncrypted);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	encrypted = encrypted.toString("hex") + ":" + iv.toString("hex");
	if (
		!encrypted.slice(0, encrypted.indexOf(":") - 1) ||
		!encrypted.slice(encrypted.indexOf(":"), -1)
	)
		fn(
			{
				message: "Error al encriptar",
				intended: toBeEncrypted,
				module: "encryption",
			},
			undefined
		);
	else fn(null, encrypted);
};

const sha_encryption = function (toBeEncrypted) {
	return new Promise((resolve, reject) => {
		const encrypted = createHmac("sha256", shasecret)
			.update(toBeEncrypted)
			.digest("hex");
		encrypted && resolve(encrypted);
		reject("No se pudo generar el token");
	});
};

const generateRandomBytes = function (size) {
	return randomBytes(size).toString("hex");
};

const decryption = function (hashToBeDecrypted, fn) {
	const encrypted = hashToBeDecrypted.split(":");
	const iv = Buffer.from(encrypted[1], "hex");
	const decipher = createDecipheriv(algorythm, Buffer.from(secret, "hex"), iv);
	let decrypted = decipher.update(encrypted[0], "hex", "utf8");
	decrypted += decipher.final("utf8");
	decrypted
		? fn(null, decrypted)
		: fn(
				{
					message: "Error al desencriptar",
					intended: hashToBeDecrypted,
					module: "decryption",
				},
				null
		  );
	return decrypted;
};

exports.encrypt = promisify(encryption);
exports.decrypt = promisify(decryption);
exports.encryptWithSha = sha_encryption;
exports.generateRandom = generateRandomBytes;
