import User from "../models/userModel";
import Book from "../models/bookModel";

export const getAdminStats = async (req: any, res: any) => {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
      },
    });
  };