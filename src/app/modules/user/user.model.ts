import { Schema, model } from 'mongoose';
import { IUser, Usermodel } from './user.interface';

const UserSchema = new Schema<IUser, Record<string, unknown>>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  wishlist: {
    type: [String],
  },
});

export const User = model<IUser, Usermodel>('User', UserSchema);
