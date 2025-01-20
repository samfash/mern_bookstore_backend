import Stripe from "stripe";
import axios from "axios";
import { Request, Response } from "express";
import dotenv from "dotenv-safe"
import Order from "../models/orderModel";
import Book from "../models/bookModel";


if(process.env.NODE_ENV === "test"){
  dotenv.config({path: ".env.test"});
} else{
  dotenv.config();
}
// Stripe Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create Payment with Stripe
export const stripePayment = async (req: Request, res: Response) => {
  try {
    const { amount, currency, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses the smallest currency unit (e.g., cents for USD)
      currency,
      description,
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};

// Paystack Payment
export const paystackPayment = async (req: Request, res: Response) => {
  try {
    const { amount, email } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        amount: amount * 100, // Paystack also uses the smallest currency unit
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json({ success: true, authorization_url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Payment Error:", error);
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};

// Flutterwave Payment
export const flutterwavePayment = async (req: Request, res: Response) => {
  try {
    const { amount, email, currency } = req.body;

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: `tx-${Date.now()}`,
        amount,
        currency,
        redirect_url: "https://your-site.com/payment-success", // Replace with your frontend's redirect URL
        customer: { email },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json({ success: true, link: response.data.data.link });
  } catch (error) {
    console.error("Flutterwave Payment Error:", error);
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};
