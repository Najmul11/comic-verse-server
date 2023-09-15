/* eslint-disable no-undef */
import httpStatus from 'http-status';
import cloudinaryHelper from '../../../cloudinary/cloudinaryHelper';
import ApiError from '../../../errors/ApiError';
import { IBook } from './book.interface';
import { Book } from './book.model';
import { IGenericServiceResponse } from '../../../interfaces/serviceResponse';
import { paginationHelpers } from '../../../pagination/paginationHelpers';
import { IPaginationOptions } from '../../../pagination/pagination.interface';

const createBook = async (
  book: IBook,
  bookCover: Express.Multer.File | undefined,
): Promise<IBook | null> => {
  const { author, title, listedBy, publishedDate } = book;
  if (!author || !title || !listedBy || !publishedDate)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  if (!bookCover)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  const bookCoverUrl = await cloudinaryHelper(
    bookCover,
    'comic-verse/book-cover',
  );

  book.bookCover = bookCoverUrl;

  const result = await Book.create(book);
  return result;
};

const getAllBooks = async (
  paginationOptions: IPaginationOptions,
): Promise<IGenericServiceResponse<IBook[]>> => {
  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  const result = await Book.find({}).skip(skip).limit(limit);

  const total = await Book.countDocuments();
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const BookService = {
  createBook,
  getAllBooks,
};
