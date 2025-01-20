import express from "express";
import {createOrder, getUserOrders} from "../controllers/orderController";
import { authenticateToken } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/", authenticateToken, createOrder);

router.get("/", authenticateToken, getUserOrders);

export default router;
