import { Request, Response } from "express";
import Order from "../models/orderModel";
import Book from "../models/bookModel";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {books, paymentMethod, totalPrice } = req.body;

    if (!req.user){
      res.status(401).json({ success: false, error: "Unauthorized." });
      return;}


     // Validate input
     if (!books || !paymentMethod || !totalPrice) {
        res.status(400).json({ success: false, error: "Missing required fields" });
        return;
      }

    // Decrease stock for each book
    for (const item of books) {
      const book = await Book.findById(item.bookId);
      if (!book || book.stock < item.quantity) {
        res.status(400).json({ error: `Book ${book?.title || "Unknown"} is out of stock` });
        return;
      }
      book.stock -= item.quantity;
      await book.save();
    }

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      books,
      totalPrice,
      paymentMethod,
      paymentStatus: "pending",
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    console.log(req.user)
    if (!req.user){
      res.status(401).json({ success: false, error: "Unauthorized." });
      return;}

    const orders = await Order.find({ user: req.user.id }).populate("books.bookId");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch orders." });
  }
};