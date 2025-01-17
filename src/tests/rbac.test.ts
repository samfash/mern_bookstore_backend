import request from "supertest";
import app from "../index"; // Ensure this points to your Express app
import Book from "../models/bookModel";
import path from "path"
import {adminToken , userToken } from "./setup";
import { string } from "joi";

describe("role based access control", ()=>{

    let bookId : string;

    it("should allow an admin to create a book", async () => {
        const response = await request(app)
          .post("/api/books")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            title: "Admin Created Book",
            author: "Admin Author",
            publishedDate: "2025-01-01",
            ISBN: "123-456-789",
          });
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Admin Created Book");

        bookId = response.body.data._id

      });
    
    it("should deny a regular user from creating a book", async () => {
    const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
        title: "User Created Book",
        author: "User Author",
        publishedDate: "2025-01-01",
        ISBN: "987-654-321",
        });
    expect(response.status).toBe(403); // Forbidden
    expect(response.body.error).toBe("Access denied");
    });

    it("should allow a regular user to fetch all books", async () => {
    const response = await request(app)
        .get("/api/books")
        .set("Authorization", `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    });

    it("should deny unauthenticated access to books", async () => {
    const response = await request(app).get("/api/books");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Access denied, no token provided");
    });

    it("should deny a regular user from updating a book", async () => {
    const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
        title: "Updated Test Book",
        author: "Updated Test Author",
        publishedDate: "2025-01-01",
        ISBN: "444-555-666",
        });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Access denied");
    })
    it("should deny a regular user from deleting a book", async () => {
        const responce = await request(app).delete(`/api/books/${bookId}`).set("Authorization", `Bearer ${userToken}`);
        expect(responce.status).toBe(403);
        expect(responce.body.error).toBe("Access denied");
    
    });
});