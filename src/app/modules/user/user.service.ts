/* eslint-disable no-undef */
import { IUser } from './user.interface';
import { User } from './user.model';
import cloudinaryHelper from '../../../cloudinary/cloudinaryHelper';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createUser = async (
  user: IUser,
  avatar: Express.Multer.File | undefined,
): Promise<IUser | null> => {
  const userExist = await User.findOne({ email: user.email });
  if (userExist)
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exist');

  let avatarUrl = '';
  if (avatar) avatarUrl = await cloudinaryHelper(avatar);

  user.avatar = avatarUrl;
  const result = await User.create(user);

  const sanitizedResult = await User.findById(result._id)
    .select('-password')
    .lean();

  return sanitizedResult;
};

export const UserService = {
  createUser,
};
