import { Model, Types } from 'mongoose';

export type IReview = {
  review: string | undefined;
  reviewer: Types.ObjectId | undefined;
};

type IBookCover = {
  publicId: string;
  photoUrl: string;
};

export type IBook = {
  title: string;
  bookCover?: IBookCover | null;
  author: string;
  genre: string;
  listedBy: Types.ObjectId | string;
  publishedDate: Date;
  reviews?: IReview[];
};

export type IBookFilters = {
  searchTerm?: string;
  genre?: string;
  year?: number[];
};

export type Bookmodel = Model<IBook, Record<string, unknown>>;
