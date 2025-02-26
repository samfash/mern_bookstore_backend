import request from "supertest";
import app from "../index"; // Ensure this points to your Express app
import {adminToken , userToken, bookId } from "./setup";
import path from "path"


describe("role based access control", ()=>{

    it("should allow an admin to create a book", async () => {
        const response = await request(app)
          .post("/api/v1/books")
          .set("Authorization", `Bearer ${adminToken}`)
          .attach("coverImage", path.resolve(__dirname, "files/sample.jpg"))
          .field("title", "Test Book")
          .field("author", "Test Author")
          .field("publishedDate", "2024-01-01")
          .field("price", "19.99")
          .field("stock", "10")
          .field("description", "This is a test book.");
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Admin Created Book again");

      });
    
    it("should deny a regular user from creating a book", async () => {
    const response = await request(app)
        .post("/api/v1/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
        title: "User Created Book",
        author: "User Author",
        publishedDate: "2025-01-01",
        ISBN: "436-6666666666",
        });
    expect(response.status).toBe(403); // Forbidden
    expect(response.body.error).toBe("Access denied");
    });

    it("should allow a regular user to fetch all books", async () => {
    const response = await request(app)
        .get("/api/v1/books")
        .set("Authorization", `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    });

    it("should deny unauthenticated access to books", async () => {
    const response = await request(app).get("/api/v1/books");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Access denied, no token provided");
    });

    it("should deny a regular user from updating a book", async () => {
    const response = await request(app)
        .put(`/api/v1/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
        title: "Updated Test Book",
        author: "Updated Test Author",
        publishedDate: "2025-01-01",
        ISBN: "444-555666666",
        });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Access denied");
    })
    it("should deny a regular user from deleting a book", async () => {
        const responce = await request(app).delete(`/api/v1/books/${bookId}`).set("Authorization", `Bearer ${userToken}`);
        expect(responce.status).toBe(403);
        expect(responce.body.error).toBe("Access denied");
    
    });
});