import request from "supertest";
import app from "../index"; // Path to your Express app


describe("Authentication Tests", () => {
  it("should register a user successfully", async () => {
    const response = await request(app).post("/api/v1/users/register").send({
      name: "Test User",
      email: "samuelfasanya351@gmail.com",
      password: "password123",
      role: "user",
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("samuelfasanya351@gmail.com");
  });

  it("should login successfully and return a token", async () => {
    const response = await request(app).post("/api/v1/users/login").send({
      email: "samuelfasanya351@gmail.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it("should fail login with incorrect credentials", async () => {
    const response = await request(app).post("/api/v1/users/login").send({
      email: "wronguser@example.com",
      password: "wrongpassword",
    });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });
});
