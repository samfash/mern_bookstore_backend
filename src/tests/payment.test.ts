import request from "supertest";
import app from "../index";
import {adminToken , userToken, bookId } from "./setup";


describe("Payment Gateways", () => {
  it("should initialize a Stripe payment", async () => {
    const response = await request(app)
      .post("/api/payments/stripe")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 100,
        currency: "usd",
        description: "Test Stripe Payment",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("clientSecret");
  });

  it("should initialize a Paystack payment", async () => {
    const response = await request(app)
      .post("/api/payments/paystack")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 100,
        email: "user@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("authorization_url");
  });

  it("should initialize a Flutterwave payment", async () => {
    const response = await request(app)
      .post("/api/payments/flutterwave")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 100,
        email: "user@example.com",
        currency: "USD",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("link");
  });
});
