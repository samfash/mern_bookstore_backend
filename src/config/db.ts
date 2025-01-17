import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState) {
    console.log("Already connected to MongoDB.");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/books");
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
