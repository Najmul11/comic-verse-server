/* eslint-disable no-console */
import { Request, Response } from 'express';
import catchAsyncError from '../../../shared/catchAsyncError';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { IUser } from './user.interface';
import { UserService } from './user.service';

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
export const UserController = {
  createUser,
};
