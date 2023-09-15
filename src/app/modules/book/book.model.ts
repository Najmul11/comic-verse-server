import { Schema, model } from 'mongoose';
import { Bookmodel, IBook } from './book.interface';

const BookSchema = new Schema<IBook, Record<string, unknown>>(
  {
    title: {
      type: String,
      required: true,
    },
    bookCover: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    listedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    reviews: [
      {
        review: {
          type: String,
          required: true,
        },
        reviewer: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Book = model<IBook, Bookmodel>('Book', BookSchema);
