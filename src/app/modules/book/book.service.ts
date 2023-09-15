/* eslint-disable no-undef */
import httpStatus from 'http-status';
import cloudinaryHelper from '../../../cloudinary/cloudinaryHelper';
import ApiError from '../../../errors/ApiError';
import { IBook } from './book.interface';
import { Book } from './book.model';

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

export const BookService = {
  createBook,
};
