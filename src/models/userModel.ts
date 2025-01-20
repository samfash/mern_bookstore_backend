import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "root-admin" | "admin" | "user";
  _id: mongoose.Types.ObjectId; // Ensure _id is correctly typed
  resetPasswordToken?: string; // Optional property
  resetPasswordExpires?: Date; // Optional property
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["root-admin", "admin", "user"],
      default: "user",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
