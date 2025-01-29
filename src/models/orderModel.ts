import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: string; // User ID
  books: {
    bookId: string; // Book ID
    quantity: number;
  }[];
  totalPrice: number;
  paymentMethod: string; // stripe, paystack, flutterwave
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  user: mongoose.Schema.Types.ObjectId,
  books: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>("Order", orderSchema);
