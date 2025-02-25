import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import Book from "../models/bookModel";
import { bookSchema, updateBookSchema } from "../utils/validator";
import {uploadToS3} from "../middleware/s3Uploader";
import {redis} from "../middleware/cacheMiddleware"
import logger from "../utils/logger";
import { deleteKeysByPattern } from "../utils/redisUtils";
import { getUpdatedCoverImage } from "../utils/imageUpdate";


export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, publishedDate, price, stock, description } = req.body;
    const ISBN = req.body.ISBN || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const { error } = bookSchema.validate({ title, author, publishedDate, ISBN, price, stock, description });

    if (error) {
      res.status(400).json({ error: error.details[0].message || "All fields are required" });
      logger.error("Validation failed", {error})
      return 
    }

    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      res.status(400).json({ error: "A book with this ISBN already exists" });
      logger.error("A book with this ISBN already exists")
      return;
    }

     // Check if a file was uploaded
     if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      logger.error("No file uploaded")
      return;
    }
    
    const fileUrl = await uploadToS3(req.file);

    const bookData = {
      title,
      author,
      publishedDate,
      ISBN,
      price,
      stock,
      description,
      coverImage: req.file ? fileUrl : null, // Store uploaded file path
    };

    const book = await Book.create(bookData);

    if(redis){
      await deleteKeysByPattern("/api/v1/books*");
    }
    
    res.status(201).json({ success: true, data: book });
    logger.info("created book successfully")
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    logger.error("Could not create book", {error})
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
    
    const totalBooks = await Book.countDocuments(query); // Get total books matching query

    // Fetch books from the database
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Cache the result in Redis
    const key = req.originalUrl;
    if (redis){
    redis.set(key, JSON.stringify({data: books}), "EX", 3600); // Cache for 1 hour
    logger.info("cache set for key: ", key)
    }
    
    // Send the response
    res.status(200).json({
      success: true,
      totalBooks, // ✅ Include total count in response
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      data: books,
    });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
      logger.error("Could not get list of data",{error})
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
      logger.error("could not get specific book",{error})
    }
  };

export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, author, publishedDate, ISBN, price, stock, description } = req.body;

      if (req.body.coverImage === "null") {
        req.body.coverImage = null;
      }

      const { error } = updateBookSchema.validate(req.body, { abortEarly: false });

      if (error) {
        res.status(400).json({ error: "Validation failed", errors: error.details });
        logger.error("Validation failed",{errors: error.details})
        return;
     }

     const existingBook = await Book.findById(id);

      if (!existingBook) {
        res.status(404).json({ success: false, error: "Book not found" });
        return;
      }

     const coverImage = await getUpdatedCoverImage(req, existingBook.coverImage);
     

      // Find the book by ID and update
      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { title, author, publishedDate, ISBN, price, stock, description, coverImage},
        { new: true, runValidators: true }
      );
  
      // Handle case where book is not found
      if (!updatedBook) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      
      if(redis){
        await deleteKeysByPattern("/api/v1/books*");
      }

      res.status(200).json({
        success: true,
        data: updatedBook,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
      logger.error("could not update the book",{error})
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
      
      if(redis){
        await deleteKeysByPattern("/api/v1/books*");
      }

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: deletedBook,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
      logger.error("the specified book could not be deleted",{error})
    }
  };
  
  