import { Request, Response } from 'express';
import catchAsyncError from '../../../shared/catchAsyncError';
import { BookService } from './book.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const createBook = catchAsyncError(async (req: Request, res: Response) => {
  const book = req.body;
  const bookCover = req.file;

  const result = await BookService.createBook(book, bookCover);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book created successfully',
    data: result,
  });
});

export const BookController = {
  createBook,
};
