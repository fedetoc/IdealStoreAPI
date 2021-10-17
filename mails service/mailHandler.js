const nodemailer = require("nodemailer");
const pug = require("pug");
const {
	Errors: { MailError },
} = require("../error handler/errorClasses");

class Email {
	constructor(mailTo) {
		this.mailTo = mailTo;
		this.mailFrom = process.env.MAIL_SENDER;
		this.mailtrap = {
			host: "smtp.mailtrap.io",
			port: 2525,
			auth: {
				user: "29b8522bc03788",
				pass: "822adc6bfcba09",
			},
		};
		this.sendgrid = {
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT,
			secure: true,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASSWORD,
			},
		};
	}

	async sendWelcomeEmail(userName, verifyUrl) {
		const html = pug.renderFile(`${__dirname}/Templates/Welcome/welcome.pug`, {
			userName,
			verifyUrl,
		});
		await this._sendmail({
			from: this.mailFrom,
			subject: "Welcome to Ideal Store",
			html,
			to: this.mailDestination,
		});
	}

	async sendPasswordResetEmail(urlPassword) {
		const html = pug.renderFile(
			`${__dirname}/Templates/Welcome/forgotPassword.pug`,
			{
				urlPassword,
			}
		);
		await this._sendmail({
			from: this.mailFrom,
			subject: "Password Reset",
			html,
			to: this.mailDestination,
		});
	}

	_checkConnection(transport) {
		let error;
		transport.verify((err, _) => (error = err));
		return error;
	}

	_sendmail(messageObj) {
		return new Promise((resolve, reject) => {
			const transport = nodemailer.createTransport(this.transportSetup);
			const connectionErr = this._checkConnection(transport);
			if (connectionErr)
				reject(
					new MailError(
						"SMTP Server Connection",
						this.mailTo,
						type,
						connectionErr
					)
				);

			const callbackSendEmail = function (err, info) {
				if (err)
					return reject(
						new MailError(
							"Send Email To recipient",
							this.mailTo,
							"registro",
							err
						)
					);
				return resolve(info);
			};
			transport.sendMail(messageObj, callbackSendEmail);
		});
	}

	get transportSetup() {
		console.log("se ejecuta el get de transport");
		return process.env.NODE_ENV === "production"
			? this.sendgrid
			: this.mailtrap;
	}

	get mailDestination() {
		console.log("se ejecuta el get de mail destination");
		const mailtrapRecipient = "3d152b88e3-751072@inbox.mailtrap.io";
		return process.env.NODE_ENV === "production"
			? this.mailTo
			: mailtrapRecipient;
	}
}

module.exports = Email;
