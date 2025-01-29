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
import helmet from "helmet";


if(process.env.NODE_ENV === "test"){
  dotenv.config({path: ".env.test"});
} else{
  dotenv.config();
}

const app = express();

var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
setUpSwagger(app)
app.use(helmet());


app.use("/api/v1", bookRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/", healthRoutes);
app.use("/admin", adminRoute);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/orders", orderRoutes);

if (process.env.NODE_ENV !== "test") {
  
  connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
}

// for testing
export default app;