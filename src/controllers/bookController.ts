import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import Book from "../models/bookModel";
import { bookSchema, idSchema } from "../utils/bookValidator";
import {uploadToS3} from "../middleware/s3Uploader";
import {redis} from "../middleware/cacheMiddleware"


export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, publishedDate, ISBN, price, stock, description } = req.body;
    const { error } = bookSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message || "All fields are required" });
      return 
    }

    const book = await Book.create({ title, author, publishedDate, ISBN, price, stock, description });
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateBookCover = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { error } = idSchema.validate(req.params);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return 
      }
  
      // Find the book by ID
      const book = await Book.findById(id);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

       // Check if a file was uploaded
       if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      
      const fileUrl = await uploadToS3(req.file);

      // Update the cover image
      book.coverImage = fileUrl;
      await book.save();
  
      res.status(200).json({ success: true, data: book });
    } catch (error: any) {
      if (error.message === "Only image files are allowed!") {
        res.status(500).json({ error: "Only image files are allowed!" });
      } else {
        res.status(500).json({ error: error.message||"Server error" });
      }
    }
  };

export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and sanitize query parameters
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const author = typeof req.query.author === "string" ? req.query.author : null;
    const title = typeof req.query.title === "string" ? req.query.title : null;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
    const sort = typeof req.query.sort === "string" ? req.query.sort : null;

    // Build the query object
    const query: any = {};
    if (author) query.author = new RegExp(author, "i");
    if (title) query.title = new RegExp(title, "i");
    if (startDate || endDate) {
      query.publishedDate = {
        ...(startDate && { $gte: startDate }),
        ...(endDate && { $lte: endDate }),
      };
    }

    // Validate and build sort options
    const sortOptions = sort
      ? sort.split(",").reduce((acc: { [key: string]: SortOrder }, field) => {
          const [key, order] = field.trim().split(":");
          acc[key] = order === "desc" ? -1 : 1;
          return acc;
        }, {})
      : null;

    // Fetch books from the database
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Cache the result in Redis
    if (redis){
    redis.set(req.originalUrl, JSON.stringify(books), "EX", 3600); // Cache for 1 hour
    }
    
    // Send the response
    res.status(200).json({
      success: true,
      data: books,
    });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "id not valid" }); // Return 400 for invalid IDs
        return;
      }
  
      // Find book by ID
      const book = await Book.findById(id);
  
      // Handle case where book is not existent
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, author, publishedDate, ISBN, price, stock, description } = req.body;

      const { error } = bookSchema.validate(req.body);

      if (error) {
        res.status(400).json({ error: "Validation failed" });
        return;
     }
  
      // Find the book by ID and update
      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { title, author, publishedDate, ISBN, price, stock, description },
        { new: true, runValidators: true }
      );
  
      // Handle case where book is not found
      if (!updatedBook) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: updatedBook,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
  
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "id not valid" }); // Return 400 for invalid IDs
        return;
      }
  
      // Find and delete the book by ID
      const deletedBook = await Book.findByIdAndDelete(id);
  
      // Handle case where book is not found
      if (!deletedBook) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
  
      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: deletedBook,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
  
  