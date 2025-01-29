import express from "express";
import {
  stripePayment,
  paystackPayment,
  flutterwavePayment,
  verifyStripePayment,
  verifyPaystackPayment,
  verifyFlutterwavePayment,
} from "../controllers/paymentController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";
import logger from "../utils/logger";


const router = express.Router();

router.post("/initiate", authenticateToken, async (req, res) => {
  const { orderId,paymentMethod, totalPrice } = req.body;

  if (!orderId  || !paymentMethod || !totalPrice) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    switch (paymentMethod) {
      case "stripe":
        return await stripePayment(orderId,paymentMethod, totalPrice, res);
      case "paystack":
        return await paystackPayment(orderId,paymentMethod, totalPrice, res);
      case "flutterwave":
        return await flutterwavePayment(orderId,paymentMethod, totalPrice, res);
      default:
        res.status(400).json({ error: "Invalid payment method" });
        return;
    }
  } catch (error) {
    logger.error("Payment initialization error:", error);
    res.status(500).json({ error: "Failed to initialize payment" });
    return;
  }
});


router.post("/verify", authenticateToken, (req, res) => {
  const { orderId,paymentMethod, ref } = req.body;

  if (!orderId  || !paymentMethod || !ref) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  switch (paymentMethod) {
    case "stripe":
      return verifyStripePayment(orderId, ref, res);
    case "paystack":
      return verifyPaystackPayment(orderId, ref, res);
    case "flutterwave":
      return verifyFlutterwavePayment(orderId, ref, res);
    default:
      res.status(400).json({ error: "Invalid payment method" });
      return;
  }
});

export default router;
