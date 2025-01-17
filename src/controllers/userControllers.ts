import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService";
import logger from "../utils/logger";

export const forgotPassword = async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();


    const resetUrl = `${req.protocol}://${req.get("host")}/api/users/reset-password/${resetToken}`;
    let text= `Click here to reset your password: ${resetUrl}`
    let subject= "Password Reset"

    // Send reset email
    await sendEmail(email,subject,text)

    res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (error) {
    const err = error as Error;
    logger.error(err.message)
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (!(await bcrypt.compare(token, user.resetPasswordToken))) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    const err = error as Error;
    logger.error(err.message)
    res.status(500).json({ error: err.message });
  }
};

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // await sendEmail(email, "Welcome to the Platform", `Hi ${name}, welcome aboard!`);

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: "Server error" });
    logger.error("Error in registration flow", { message: err.message });
  }
};

// Login a user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ error: "Invalid password" });
        return
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    const err = error as Error;
    logger.error(err.message)
    res.status(500).json({ error: "Server error" });
  }
};
