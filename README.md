# 📒 Online Bookstore Backend API

A **MERN Stack Backend** for an Online Bookstore, featuring **authentication, role-based access control (RBAC), book management, orders, payments (Stripe, Paystack, Flutterwave), caching with Redis, AWS S3 file storage, and testing with Jest & Supertest**.

---

## **🚀 Features**
✅ **User Authentication (JWT-based)**  
✅ **Role-Based Access Control (RBAC: User, Admin, Root-Admin)**  
✅ **Book Management (CRUD, AWS S3 Image Uploads)**  
✅ **Order & Cart System (Persistent with Redis)**  
✅ **Payment Gateways (Stripe, Paystack, Flutterwave)**  
✅ **Redis Caching for Optimized Performance**  
✅ **API Documentation with Swagger**  
✅ **Testing with Jest & Supertest**  
✅ **Error Handling & Logging**  
✅ **Docker & AWS EC2 Deployment Support**  

---

## **📌 Setup Instructions**
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/samfash/mern-bookstore-backend.git
cd src
```

### **2. install Dependencies**
```bash
npm install
```
### **3. set up environmental variables**
```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis Cache
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET_NAME=your-bucket-name

# Payment Gateways
STRIPE_SECRET_KEY=your-stripe-secret
PAYSTACK_SECRET_KEY=your-paystack-secret
FLW_SECRET_KEY=your-flutterwave-secret
```
### **4. start the redis server**
```bash
npm install
```
### **5. run the application**
- **for development**
```bash
npm run dev
```
- **for production**
```bash
npm run build
```
- **for Testing**
```bash
npm test
```
## **📌 API Documentation**

## **📌 Available EndPoints**
### **📌 Authentication**
### **register User (POST /api/v1/register)**
- **URL**: /api/v1/register
- **HTTP Method**: POST
- **Description**: Register a new user
- **Request Body**: {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"}
- **Responce**:{
    "success": true,
    "message": "User registered successfully"
}
-**Error**:400 Bad Request (missing fields):
            {
            "error": "Email is already in use"
            }

### **login User (POST /api/v1/login)**
- **URL**: /api/v1/login
- **HTTP Method**: POST
- **Description**:  Logs in a user and returns a JWT token
- **Request Body**: {
    "email": "john@example.com",
    "password": "password123"}
- **Responce**:{
    "success": true,
    "message": "twt_token_here"
}
-**Error**:401 Bad Request (Unauthorized):
            {
            "error": "Invalid email or password"
            }

### **📌 Book Management**
### **Enpoints for Create Book (POST /api/v1/books)**
- **URL**: /api/v1/books
- **HTTP Method**: POST
- **Description**: Create a new book (Admin Only)
- **Request Body**: {
  "title": "Sample Book",
  "author": "John Doe",
  "publishedDate": "2024-01-01",
  "ISBN": "123-456-789",
  "price": 15.99,
  "stock": 10,
  "description": "A classic novel"
}

- **Responce**:{
  "success": true,
  "data": {
    "_id": "64abc12345def67890gh1234",
    "title": "Sample Book",
    "author": "John Doe",
    "publishedDate": "2024-01-01T00:00:00.000Z",
    "ISBN": "123-456-789",
    "coverImage": null,
    "__v": 0
  }
}

-**Error**:400 Bad Request (missing fields):
            {
            "error": "All fields are required"
            }

### **Enpoints for Get All Books (GET /api/v1/books)**
- **URL**: /api/v1/books
- **HTTP Method**: GET
- **Description**: Get all books (Supports pagination, sorting, filtering)
- **Request Body**: {
    page (optional) - Page number
    limit (optional) - Number of items per page
    title (optional) - Filter by book title
    author (optional) - Filter by author
    sort (optional) - Sorting (e.g., title:asc,author:desc)
}
- **Responce**: {"success": true,
                        "data": [
                            {
                            "_id": "64abc12345def67890gh1234",
                            "title": "Sample Book",
                            "author": "John Doe",
                            "publishedDate": "2024-01-01T00:00:00.000Z",
                            "ISBN": "123-456-789",
                            "coverImage": "uploads/1735006951759-bike_pic.jpg",
                            "__v": 0
                            }
                        ]
                    }

### **Enpoints for Update (POST /api/v1/books/:id)**
- **URL**: /api/v1/books/:id
- **HTTP Method**: PATCH
- **Description**: Update book details (Admin Only)
- **Request Body**: {
  "title": "Sample Book",
  "author": "John Doe",
  "publishedDate": "2024-01-01",
  "ISBN": "123-456-789",
  "price": 15.99,
  "stock": 10,
  "description": "A classic novel"
}

- **Responce**:{
  "success": true,
  "data": {
    "_id": "64abc12345def67890gh1234",
    "title": "Sample Book",
    "author": "John Doe",
    "publishedDate": "2024-01-01T00:00:00.000Z",
    "ISBN": "123-456-789",
    "coverImage": null,
    "__v": 0
  }
}

### **Enpoints for delete (POST /api/v1/books/:id)**
- **URL**: /api/v1/books/:id
- **HTTP Method**: DELETE
- **Description**: Delete a book (Admin Only)
- **Responce**:{
    "success": true,
}

### **📌 Orders & Cart**
### **Create Ordeer (POST /api/v1/orders)**
- **URL**: /api/v1/register
- **HTTP Method**: POST
- **Description**: Create a new order (Requires Cart Data)
- **Request Body**: {
    "books": [{ "bookId": "64abc12345def67890gh1234", "quantity": 2 }],
  "paymentMethod": "stripe",
  "totalPrice": 39.98
}
- **Responce**:{
    "success": true,
    "message": "Order placed successfully",
    "orderId": "64fgh56789abcd12345efgh"
}

### **Get Order list (GET /api/v1/orders)**
- **URL**: /api/v1/orders
- **HTTP Method**: GET
- **Description**: Get user orders (Authenticated Users)
- **Responce**:{
    "success": true,
    "data":{
        "orderId": "64fgh56789abcd12345efgh"
         "books": [{ "bookId": "64abc12345def67890gh1234", "quantity":2 }],
  "paymentMethod": "stripe",
  "totalPrice": 39.98
    }
}

### **📌 Payments**
### **Initiate Payment (POST /api/v1/payments/initiate)**
- **URL**: /api/v1/payments/initiate
- **HTTP Method**: POST
- **Description**: Initiates a payment via Stripe, Paystack, or Flutterwave.
- **Request Body**: {
    "orderId": "64fgh56789abcd12345efgh",
    "totalPrice": 39.98,
    "paymentMethod": "stripe"
}
- **Responce**:{
    "success": true,
    "paymentUrl": "https://checkout.stripe.com/pay/..."
}

### **verify Payment (GET /api/v1/payments/verify)**
- **URL**: /api/v1/payments/verify
- **HTTP Method**: GET
- **Description**: verify a payment via Stripe, Paystack, or Flutterwave.
- **Request Body**: {
    "orderId": "64fgh56789abcd12345efgh",
    "paymentMethod": "stripe",
    "reference":"89abcd12345efgh"
}
- **Responce**:{
    "success": true,
    "message": "Payment verified successfully"
}

## **📌 Contributors**
- **Samuel Fasanya-[Github](https://github.com/samfash)**



