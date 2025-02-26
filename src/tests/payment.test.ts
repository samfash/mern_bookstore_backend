import request from "supertest";
import app from "../index";
import {adminToken , userToken, bookId } from "./setup";


describe("Payment Gateways", () => {
  it("should initialize a Stripe payment", async () => {
    const response = await request(app)
      .post("/api/v1/payments/initiate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        orderId: "64abc12345def67890gh1234",
        totalPrice: 39.98,
        paymentMethod: "stripe",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("paymentUrl");
  });

  it("should initialize a Paystack payment", async () => {
    const response = await request(app)
      .post("/api/v1/payments/initiate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        orderId: "64abc12345def67890gh1235",
        totalPrice: 39.98,
        paymentMethod: "paystack",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("paymentUrl");
  });

  it("should initialize a Flutterwave payment", async () => {
    const response = await request(app)
      .post("/api/v1/payments/initiate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        orderId: "64abc12345def67890gh1236",
        totalPrice: 39.98,
        paymentMethod: "flutterwave",

      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty("paymentUrl");
  });
});
