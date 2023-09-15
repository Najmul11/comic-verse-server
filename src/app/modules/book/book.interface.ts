import { Model, Types } from 'mongoose';

type IReview = {
  review: string;
  reviewer: Types.ObjectId;
};

type IBookCover = {
  publicId: string;
  photoUrl: string;
};

export type IBook = {
  title: string;
  bookCover: IBookCover | null;
  author: string;
  genre: string;
  listedBy: Types.ObjectId;
  publishedDate: Date;
  reviews?: IReview[];
};

export type Bookmodel = Model<IBook, Record<string, unknown>>;
