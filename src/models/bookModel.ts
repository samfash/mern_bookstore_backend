import mongoose, { Schema, Document} from "mongoose";

interface IBook extends Document{
    title: string;
    author: string;
    publishedDate: Date;
    ISBN: string;
    coverImage?: string;
    price: number; // New field
    stock: number; // New field
    description?: string; // optional
    _id: mongoose.Types.ObjectId;
}

const bookSchema = new Schema<IBook>({
    title: {type: String, required: true},
    author: {type: String, required: true},
    publishedDate: {type: Date, required: true},
    ISBN: {type: String, required: true, unique: true},
    coverImage: {type: String},
    price: { type: Number, required: true }, // New field
    stock: { type: Number, required: true, default: 0 }, // New field
    description: { type: String }, // New field
});

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;