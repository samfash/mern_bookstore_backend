import express from "express";
import { createBook,
    // updateBookCover,
    getAllBooks, 
    getBookById, 
    updateBook, 
    deleteBook,} from "../controllers/bookController";
import {upload, generateSignedUrl} from "../middleware/s3Uploader";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";
import { cache } from "../middleware/cacheMiddleware"
import logger from "../utils/logger";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - ISBN
 *         - price
 *         - stock
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         publishedDate:
 *           type: string
 *           format: date
 *           description: The publication date of the book
 *         ISBN:
 *           type: string
 *           description: The book's ISBN number
 *         price:
 *           type: number
 *         stock:
 *           type: number
 *         description:
 *           type: string
 *         coverImage:
 *           type: string
 *           format: binary
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */

router.post("/books",authenticateToken, authorizeRoles("root-admin", "admin"), upload.single("coverImage"), createBook);

router.get("/books", cache, authenticateToken, getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: The book ID
 *         required: true
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */

router.get("/books/:id",authenticateToken, getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: The book ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Updated Book successfully
 *       404:
 *         description: Book not found
 */

router.patch("/books/:id", authenticateToken, authorizeRoles("root-admin", "admin"), upload.single("coverImage"), updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           description: The book ID
 *         required: true
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */

router.delete("/books/:id",authenticateToken,authorizeRoles("root-admin", "admin"), deleteBook);

router.get("/get-signed-url/:key", async (req, res) => {
    try {
      const signedUrl = await generateSignedUrl(req.params.key);
      res.json({ url: signedUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate signed URL" });
      logger.error("Failed to generate signed URL", error);
    }
  });
  

export default router;
