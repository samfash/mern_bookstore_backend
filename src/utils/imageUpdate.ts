import { Request} from "express";
import {uploadToS3} from "../middleware/s3Uploader";


export const getUpdatedCoverImage = async (req: Request, existingCoverImage: string | undefined): Promise<string | undefined> => {
    if (req.file) {
      return await uploadToS3(req.file);
    }
    if (req.body.coverImage === "" || req.body.coverImage === null) {
      return existingCoverImage; // Retain current value
    }
    return req.body.coverImage;
  };
  