import request from "supertest";
import { userToken, bookId} from "./setup";
import app from "../index";

describe("Orders", () => {
  let orderId: string;

  it("should create a new order", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        books: [{ bookId, title: "spidey", quantity: 2 }],
        paymentMethod: "stripe",
        totalPrice: 39.98,
        paymentStatus: "paid",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("books");
    orderId = response.body.data._id;
  });

  it("should fetch user-specific orders", async () => {
    const response = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]._id).toBe(orderId);
  });
});
