/* eslint-disable no-console */
/* eslint-disable no-undef */
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IBook, IBookFilters, IReview } from './book.interface';
import { Book } from './book.model';
import { IGenericServiceResponse } from '../../../interfaces/serviceResponse';
import { paginationHelpers } from '../../../pagination/paginationHelpers';
import { IPaginationOptions } from '../../../pagination/pagination.interface';
import { cloudinaryHelper } from '../../../cloudinary/cloudinaryHelper';
import { SortOrder, Types } from 'mongoose';
import { bookSearchableFields } from './book.constant';

const createBook = async (
  book: Partial<IBook>,
  bookCover: Express.Multer.File | undefined,
  listedBy: string,
): Promise<IBook | null> => {
  const { author, title, publishedDate, genre } = book;

  if (!author || !title || !listedBy || !publishedDate || !genre)
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');

  if (!bookCover)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide a cover photo');

  const bookCoverUrl = await cloudinaryHelper.uploadToCloudinary(
    bookCover,
    'comic-verse/book-cover',
  );

  book.bookCover = bookCoverUrl;
  book.listedBy = listedBy;

  const result = await Book.create(book);
  return result;
};

const getAllBooks = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericServiceResponse<IBook[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const { searchTerm, year, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: bookSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (year && year.length > 0) {
    // Include a condition to match books with specific years
    andConditions.push({
      publishedDate: {
        $in: year.map(year => new Date(`${year}-01-01T00:00:00.000Z`)),
      },
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Book.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

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
  const result = await Book.findById(id).populate('reviews.reviewer', 'name');
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
  id: string,
): Promise<IBook | null> => {
  const book = await Book.findById(bookId);
  if (!book)
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the book');

  const query = {
    _id: bookId,
    'reviews.reviewer': id,
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
    payload.reviewer = new Types.ObjectId(id);

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

const deleteReview = async (
  bookId: string,
  id: string,
): Promise<IBook | null> => {
  const book = await Book.findById(bookId);
  if (!book)
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the book');

  const query = {
    _id: bookId,
    'reviews.reviewer': id,
  };

  const update = {
    $pull: { reviews: { reviewer: id } },
  };

  const options = {
    new: true,
    select: { title: 1, reviews: 1 },
  };

  const updatedBook = await Book.findOneAndUpdate(
    query,
    update,
    options,
  ).populate('reviews.reviewer', 'name avatar.photoUrl');

  return updatedBook;
};

export const BookService = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getSingleBook,
  postReview,
  deleteReview,
};
