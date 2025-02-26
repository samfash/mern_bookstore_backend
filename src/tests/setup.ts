import mongoose from "mongoose";
import http from "http"
import app from "../index"; // Path to your app
import request from "supertest";
import dotenv from "dotenv-safe";
import Book from "../models/bookModel";
import User from "../models/userModel";



dotenv.config({ path: ".env.test"});
let server: http.Server; // Store the server instance
export let serverPort: number; // Store the dynamic port

export let adminToken: string;
export let userToken: string;
export let bookId: string;

const adminEmail = `admin-${Date.now()}@example.com`; // Unique admin email
const userEmail = `user-${Date.now()}@example.com`;   // Unique user email
const uniqueISBN = `123-4561234${Date.now()}`; // Unique ISBN


beforeAll(async () => {
  // Connect to test database
  if(!mongoose.connection.readyState){
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test-books");
  }

  server = app.listen(0, ()=>{
    serverPort = (server.address() as any).port;
    console.log(`Test server running on port ${serverPort}`);
  });
// });
    
//   beforeEach(async () => {
//     if (!mongoose.connection.db) {
//       throw new Error("Database is not connected. Ensure mongoose.connect() is successful.");
//     }
  
//     // Clear database before each test
//     await mongoose.connection.db.dropDatabase();

  // Seed admin user
  const adminResponse = await request(app).post("/api/v1/users/register").send({
    name: "Admin User",
    email: adminEmail,
    password: "password123",
    role: "admin",
  });
  adminToken = (await request(app).post("/api/v1/users/login").send({
    email: adminEmail,
    password: "password123",
  })).body.token;

  // Seed regular user
  const userResponse = await request(app).post("/api/v1/users/register").send({
    name: "Regular User",
    email: userEmail,
    password: "password123",
    role: "user",
  });
  userToken = (await request(app).post("/api/v1/users/login").send({
    email: userEmail,
    password: "password123",
  })).body.token;


  const book = await Book.create({
    title: "Test Book",
    author: "Test Author",
    publishedDate: new Date("2023-01-01"),
    ISBN: uniqueISBN,
    price: 19.99,
    stock: 10,
    description: "This is a test book.",
  });
  bookId = book._id.toString();
}, 30000); //because of the mailing that takes time.

afterAll(async () => {
  // await Book.deleteMany({});
  // await User.deleteMany({});

  // Drop test database
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  if (server) {
    server.close();
  }
});


