import Stripe from "stripe";
import axios from "axios";
import {Response } from "express";
import dotenv from "dotenv-safe"
import logger from "../utils/logger";
import Order from "../models/orderModel";
// import { stripePaymentSchema } from "../utils/validator";


if(process.env.NODE_ENV === "test"){
  dotenv.config({path: ".env.test"});
} else{
  dotenv.config();
}
// Stripe Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create Payment with Stripe
export const stripePayment = async (orderId: string,paymentMethod:string ,totalPrice: number, res:Response) => {


    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Order Payment" },
              unit_amount: Math.round(totalPrice * 100), // Stripe requires amounts in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/success?orderId=${orderId}&paymentMethod=${paymentMethod}`,
        cancel_url: `${process.env.FRONTEND_URL}/failure?orderId=${orderId}`,
      });

    res.status(200).json({ success: true, paymentUrl: session.url  });
  } catch (error) {
    logger.error("Stripe Payment Error:", {error});
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};

// Paystack Payment
export const paystackPayment = async (orderId: string,paymentMethod:string, totalPrice: number, res:Response) => {

  try {

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: process.env.EMAIL_USER,
        amount: Math.round(totalPrice * 100), // Paystack requires amounts in kobo
        callback_url: `${process.env.FRONTEND_URL}/success?orderId=${orderId}&paymentMethod=${paymentMethod}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json({ success: true, paymentUrl: response.data.data.authorization_url });
  } catch (error) {
    logger.error("Paystack Payment Error:", {error});
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};

// Flutterwave Payment
export const flutterwavePayment = async (orderId: string,paymentMethod:string, totalPrice: number, res:Response) => {

  try {

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: orderId,
        amount: totalPrice,
        currency: "USD",
        redirect_url: `${process.env.FRONTEND_URL}/success?orderId=${orderId}&paymentMethod=${paymentMethod}`,
        customer: {
          email: process.env.EMAIL_uSER,
        },
        customizations: {
          title: 'Fash Book Store',
          description: 'Payment for items in cart',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json({ success: true, paymentUrl: response.data.data.link });
  } catch (error) {
    logger.error("Flutterwave Payment Error:", {error});
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};



/**
 * Verify Stripe Payment
 */
export const verifyStripePayment = async (orderId: string, paymentIntentId:string, res: Response) => {

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "success" });
      res.status(200).json({ success: true, message: "Payment verified successfully" });
      return;
    } else {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failure" });
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return ;
    }
  } catch (error) {
    logger.error("Stripe verification error:", error);
    res.status(500).json({ error: "Failed to verify Stripe payment" });
    return 
  }
};

/**
 * Verify Paystack Payment
 */
export const verifyPaystackPayment = async (orderId: string, reference:string, res: Response) => {

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    if (response.data.status && response.data.data.status === "success") {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "success" });
      res.status(200).json({ success: true, message: "Payment verified successfully" });
      return ;
    } else {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failure" });
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return ;
    }
  } catch (error) {
    logger.error("Paystack verification error:", error);
    res.status(500).json({ error: "Failed to verify Paystack payment" });
    return;
  }
};

/**
 * Verify Flutterwave Payment
 */
export const verifyFlutterwavePayment = async (orderId: string, transaction_id:string, res: Response) => {

  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
    });

    if (response.data.status === "success") {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "success" });
      res.status(200).json({ success: true, message: "Payment verified successfully" });
      return ;
    } else {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failure" });
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return ;
    }
  } catch (error) {
    logger.error("Flutterwave verification error:", error);
    res.status(500).json({ error: "Failed to verify Flutterwave payment" });
    return ;
  }
};
