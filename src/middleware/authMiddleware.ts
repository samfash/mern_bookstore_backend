import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import logger from "../utils/logger";


interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    logger.error("Error in token given, no token at all");
    res.status(401).json({ error: "Access denied, no token provided" });
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {id: string};
    const user = await User.findById(decoded.id);

    if (!user){
      logger.error("Error in token given, no token assigned to any user");
      res.status(401).json({ success: false, error: "User not found." });
      return;}

    req.user = { id: user._id.toString(), role: user.role }
    next();
  } catch (error) {
    const err = error as Error;
    logger.error("Token is in invalid format",{message:err.message})
    res.status(401).json({ error: "Invalid token" });
  }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        logger.error("Not admin")
        res.status(403).json({ error: "Access denied" });
        return 
      }
      next();
    };
  };
  