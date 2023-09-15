import { Model, Types } from 'mongoose';

type IReview = {
  review: string;
  reviewer: Types.ObjectId;
};

export type IBook = {
  title: string;
  bookCover: string;
  author: string;
  genre: string;
  listedBy: Types.ObjectId;
  publishedDate: Date;
  reviews?: IReview[];
};

export type Bookmodel = Model<IBook, Record<string, unknown>>;
