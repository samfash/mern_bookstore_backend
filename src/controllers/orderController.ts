import { Request, Response } from "express";
import Order from "../models/orderModel";
import Book from "../models/bookModel";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, books, paymentMethod, totalPrice } = req.body;

     // Validate input
     if (!userId || !books || !paymentMethod || !totalPrice) {
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
      user: userId,
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
