/* eslint-disable no-console */
/* eslint-disable no-undef */
import { IUser, IUserLogin } from './user.interface';
import { User } from './user.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import {
  IRefreshTokenResponse,
  IUserLoginResponse,
} from '../../../jwt/jwt.interface';
import { jwtHelpers } from '../../../jwt/jwtHelper';
import config from '../../../config';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { cloudinaryHelper } from '../../../cloudinary/cloudinaryHelper';
import { Types } from 'mongoose';
import { Book } from '../book/book.model';

const createUser = async (
  user: IUser,
  avatar: Express.Multer.File | undefined,
): Promise<IUser | null> => {
  const { email, password, name } = user;
  if (!email || !password || !name)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  const userExist = await User.findOne({ email });
  if (userExist)
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exist');

  let avatarUrl = null;
  if (avatar)
    avatarUrl = await cloudinaryHelper.uploadToCloudinary(
      avatar,
      'comic-verse/avatars',
    );

  user.avatar = avatarUrl!;
  const result = await User.create(user);

  const sanitizedResult = await User.findById(result._id)
    .select('-password')
    .lean();

  return sanitizedResult;
};

const loginUser = async (payload: IUserLogin): Promise<IUserLoginResponse> => {
  const { email: givenEmail, password } = payload;

  const user = new User();
  const isUserExist = await user.isUserExist(givenEmail);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (
    isUserExist.password &&
    !(await user.isPasswordMatched(password, isUserExist?.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ' Password is incorrect');
  }

  // create access token , refresh token
  const { _id, email } = isUserExist;

  const accessToken = jwtHelpers.createToken(
    { _id, email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { _id, email },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }
  // checking deleted user refresh  token

  const { _id } = verifiedToken;

  const isUserExist = await User.findById(_id, { _id: 1, email: 1 });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // generate new user refresh token
  const newAccesstoken = jwtHelpers.createToken(
    {
      _id: isUserExist._id,
      email: isUserExist.email,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );
  return {
    accessToken: newAccesstoken,
  };
};

const addToWishlist = async (
  bookId: string,
  userId: JwtPayload | null,
): Promise<IUser | null> => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(httpStatus.NOT_FOUND, "Couln't find book");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const bookObjectId = new Types.ObjectId(bookId);
  if (user.wishlist?.includes(bookObjectId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Book is already in your wishlist',
    );
  }

  const wish = {
    $push: {
      wishlist: bookId,
    },
  };

  const result = await User.findByIdAndUpdate(userId, wish, { new: true })
    .select('-password')
    .populate('wishlist');
  return result;
};

const deleteFromWishlist = async (
  bookId: string,
  userId: JwtPayload | null,
): Promise<IUser | null> => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(httpStatus.NOT_FOUND, "Couln't find book");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const bookObjectId = new Types.ObjectId(bookId);
  let result = null;
  if (user.wishlist?.includes(bookObjectId)) {
    const wish = {
      $pull: {
        wishlist: bookId,
      },
    };

    result = await User.findByIdAndUpdate(userId, wish, { new: true })
      .select('-password')
      .populate('wishlist');
  }
  return result;
};

export const UserService = {
  createUser,
  loginUser,
  refreshToken,
  addToWishlist,
  deleteFromWishlist,
};
