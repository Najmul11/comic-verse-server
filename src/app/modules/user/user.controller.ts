/* eslint-disable no-console */
import { Request, Response } from 'express';
import catchAsyncError from '../../../shared/catchAsyncError';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { IUser } from './user.interface';
import { UserService } from './user.service';
import config from '../../../config';
import {
  IRefreshTokenResponse,
  IUserLoginResponse,
} from '../../../jwt/jwt.interface';

const createUser = catchAsyncError(async (req: Request, res: Response) => {
  const user = req.body;
  const avatar = req.file;

  const result = await UserService.createUser(user, avatar);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const loginUser = catchAsyncError(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;

  const result = await UserService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  const cookieOptions = {
    secure: config.env === ' production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IUserLoginResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user logged in successfully!',
    data: others,
  });
});

const refreshToken = catchAsyncError(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await UserService.refreshToken(refreshToken);

  const cookieOptions = {
    secure: config.env === ' production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'New access token generated successfully',
    data: result,
  });
});

const addToWishlist = catchAsyncError(async (req: Request, res: Response) => {
  const { id: bookId } = req.params;
  const { id } = req.body;

  const result = await UserService.addToWishlist(bookId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book added to wishlist',
    data: result,
  });
});
const deleteFromWishlist = catchAsyncError(
  async (req: Request, res: Response) => {
    const { id: bookId } = req.params;
    const { id } = req.body;

    const result = await UserService.deleteFromWishlist(bookId, id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Book removed from  wishlist',
      data: result,
    });
  },
);

export const UserController = {
  createUser,
  loginUser,
  refreshToken,
  addToWishlist,
  deleteFromWishlist,
};
