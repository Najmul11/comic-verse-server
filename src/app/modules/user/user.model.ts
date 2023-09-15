/* eslint-disable @typescript-eslint/no-this-alias */

import { Schema, model } from 'mongoose';
import { IUser, IUserMethods, Usermodel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../../config';

const UserSchema = new Schema<IUser, Record<string, unknown>, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      publicId: {
        type: String,
      },
      photoUrl: {
        type: String,
      },
    },
    wishlist: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.isUserExist = async function (
  email: string,
): Promise<Partial<IUser> | null> {
  return await User.findOne({ email });
};

UserSchema.methods.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.pre('save', async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_round),
  );
  next();
});

export const User = model<IUser, Usermodel>('User', UserSchema);
