import { Model, Types } from 'mongoose';

type IWishlist = Types.ObjectId;

export type IUser = {
  email: string;
  password: string;
  name: string;
  avatar: string;
  wishlist?: IWishlist[];
};

export type Usermodel = Model<IUser, Record<string, unknown>>;
