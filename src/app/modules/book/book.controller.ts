import { Request, Response } from 'express';
import catchAsyncError from '../../../shared/catchAsyncError';
import { BookService } from './book.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../pagination/pagination.constant';
import { IBook, IReview } from './book.interface';

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

const getAllBooks = catchAsyncError(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields);
  const result = await BookService.getAllBooks(paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All books retrieved successfully',
    data: result,
  });
});

const getSingleBook = catchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookService.getSingleBook(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All books retrieved successfully',
    data: result,
  });
});

const updateBook = catchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload: Partial<IBook> = req.body;
  const bookCover = req.file;

  const result = await BookService.updateBook(id, payload, bookCover);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book updated successfully',
    data: result,
  });
});

const deleteBook = catchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BookService.deleteBook(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book deleted successfully',
    data: result,
  });
});

const postReview = catchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload: IReview = req.body;

  const result = await BookService.postReview(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'You have succeeded reviewing the book',
    data: result,
  });
});

const deleteReview = catchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload: Partial<IReview> = req.body;

  const result = await BookService.deleteReview(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const BookController = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getSingleBook,
  postReview,
  deleteReview,
};
