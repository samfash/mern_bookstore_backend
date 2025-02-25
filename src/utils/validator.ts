import Joi from "joi";

export const bookSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  author: Joi.string().min(3).max(100).required(),
  publishedDate: Joi.date().required(),
  ISBN: Joi.string().pattern(/^\d{3}-\d{10}$/).required(),
  price: Joi.number().required(), // Add price
  stock: Joi.number().required(), // Add stock
  description: Joi.string().optional(), // Add description
});

export const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

export const stripePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  description: Joi.string().optional(),
});

// Schema for Book validation
export const updateBookSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  author: Joi.string().min(3).max(255).optional(),
  publishedDate: Joi.date().optional(),
  ISBN: Joi.string()
    .regex(/^\d{3}-\d{10}$/)
    .optional(), // Validate ISBN format
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(500).optional(),
  coverImage: Joi.string()
    .uri({ scheme: ["http", "https"] }) // Validate it’s a valid URI with http/https
    .allow(null) // ✅ Allow null values
    .optional(),
});

