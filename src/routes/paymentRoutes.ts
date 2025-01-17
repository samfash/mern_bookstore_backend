import express from "express";
import {
  stripePayment,
  paystackPayment,
  flutterwavePayment,
} from "../controllers/paymentController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/stripe",authenticateToken, stripePayment); // Stripe payment route
router.post("/paystack",authenticateToken, paystackPayment); // Paystack payment route
router.post("/flutterwave",authenticateToken, flutterwavePayment); // Flutterwave payment route

export default router;
