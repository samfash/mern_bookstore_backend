import nodemailer from "nodemailer";
import logger from "./logger";

const googleAppPassword = process.env.CLIENT_PASS

export const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: 'nheq zzqi wcyb zcpe',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
  };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    const err = error as Error;
    logger.error("Error sending mail",{message: err.message})
    console.error("Error sending email", error);
  }
};