/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type IWishlist = Types.ObjectId;

type IAvatar = {
  publicId: string;
  photoUrl: string | undefined;
};

export type IUser = {
  _id?: Types.ObjectId | undefined | null;
  email: string;
  password: string;
  name: string;
  avatar?: IAvatar;
  wishlist?: IWishlist[];
};

export type IUserMethods = {
  isUserExist(email: string): Promise<Partial<IUser> | null>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>;
};

export type Usermodel = Model<IUser, Record<string, unknown>, IUserMethods>;

export type IUserLogin = {
  email: string;
  password: string;
};
