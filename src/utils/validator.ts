import Joi from "joi";

export const bookSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  author: Joi.string().min(3).max(100).required(),
  publishedDate: Joi.date().required(),
  ISBN: Joi.string().pattern(/^\d{3}-\d{3}-\d{3}$/).required(),
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
