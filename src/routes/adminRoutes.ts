import express from "express";
import { getAdminStats } from "../controllers/adminController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";


const router = express.Router();
router.get("/stats", authenticateToken, authorizeRoles("root-admin", "admin"), getAdminStats);

export default router;