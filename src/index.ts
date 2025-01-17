import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv-safe";
import connectDB from "./config/db";
import bookRoutes from "./routes/bookRoutes";
import userRoutes from "./routes/userRoutes";
import healthRoutes from "./routes/healthRoutes";
import adminRoute from "./routes/adminRoutes"
import paymentRoutes from "./routes/paymentRoutes";
import orderRoutes from "./routes/orderRoutes";
import { limiter } from "./middleware/rateLimiter";
import setUpSwagger from "./swagger"

if(process.env.NODE_ENV === "test"){
  dotenv.config({path: ".env.test"});
} else{
  dotenv.config();
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
setUpSwagger(app)

app.use("/api", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api", healthRoutes);
app.use("/admin", adminRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);

if (process.env.NODE_ENV !== "test") {
  
  connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
}

// for testing
export default app;