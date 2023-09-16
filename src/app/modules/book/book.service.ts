/* eslint-disable no-console */
/* eslint-disable no-undef */
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IBook, IReview } from './book.interface';
import { Book } from './book.model';
import { IGenericServiceResponse } from '../../../interfaces/serviceResponse';
import { paginationHelpers } from '../../../pagination/paginationHelpers';
import { IPaginationOptions } from '../../../pagination/pagination.interface';
import { cloudinaryHelper } from '../../../cloudinary/cloudinaryHelper';

const createBook = async (
  book: IBook,
  bookCover: Express.Multer.File | undefined,
): Promise<IBook | null> => {
  const { author, title, listedBy, publishedDate } = book;
  if (!author || !title || !listedBy || !publishedDate)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  if (!bookCover)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  const bookCoverUrl = await cloudinaryHelper.uploadToCloudinary(
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

const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id);
  return result;
};

const updateBook = async (
  id: string,
  payload: Partial<IBook>,
  bookCover: Express.Multer.File | undefined,
): Promise<IBook | null> => {
  const book = await Book.findById(id);
  if (!book)
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the book');

  if (bookCover) {
    const imagePublicId = book.bookCover!.publicId;
    await cloudinaryHelper.deleteFromCloudinary(imagePublicId);
    payload.bookCover = await cloudinaryHelper.uploadToCloudinary(
      bookCover,
      'comic-verse/book-cover',
    );
  }

  const result = await Book.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteBook = async (id: string): Promise<IBook | null> => {
  const book = await Book.findById(id);
  if (!book)
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the book');

  const imagePublicId = book.bookCover!.publicId;
  await cloudinaryHelper.deleteFromCloudinary(imagePublicId);

  const result = await Book.findByIdAndDelete(id);
  return result;
};

const postReview = async (
  bookId: string,
  payload: Partial<IReview>,
): Promise<IBook | null> => {
  const book = await Book.findById(bookId);
  if (!book)
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the book');

  const query = {
    _id: bookId,
    'reviews.reviewer': payload.reviewer,
  };

  const updatedReview = {
    $set: {
      'reviews.$.review': payload.review,
    },
  };

  const existingReview = await Book.findOneAndUpdate(query, updatedReview, {
    new: true,
    select: { title: 1, reviews: 1 },
  }).populate('reviews.reviewer', 'name avatar.photoUrl ');

  if (!existingReview) {
    const review = {
      $push: {
        reviews: payload,
      },
    };

    const result = await Book.findByIdAndUpdate(bookId, review, {
      new: true,
      select: { title: 1, reviews: 1 },
    }).populate('reviews.reviewer', 'name avatar.photoUrl ');

    return result;
  }

  return existingReview;
};

export const BookService = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getSingleBook,
  postReview,
};
