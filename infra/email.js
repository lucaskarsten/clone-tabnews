import nodemailer from "nodemailer";
import { ServiceError } from "infra/errors.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: process.env.EMAIL_SMTP_SECURE === "true",
  // O mailcatcher local não usa autenticação.
  auth: process.env.EMAIL_SMTP_USER
    ? {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      }
    : undefined,
});

async function send(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Não foi possível enviar o email.",
    });
  }
}

const email = {
  send,
};

export default email;
