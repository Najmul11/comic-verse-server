import { NextFunction, Request, Response } from 'express';
import { Book } from '../modules/book/book.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const specificAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');

    if (user?._id !== book.listedBy.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default specificAuth;
