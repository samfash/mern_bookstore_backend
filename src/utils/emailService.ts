import nodemailer from "nodemailer";
import logger from "./logger";

export const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject,
      text,
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Error sending mail",{message: err.message})
    console.error("Error sending email", error);
  }
};