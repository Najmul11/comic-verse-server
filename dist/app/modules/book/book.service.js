"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
/* eslint-disable no-console */
/* eslint-disable no-undef */
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const book_model_1 = require("./book.model");
const paginationHelpers_1 = require("../../../pagination/paginationHelpers");
const cloudinaryHelper_1 = require("../../../cloudinary/cloudinaryHelper");
const mongoose_1 = require("mongoose");
const book_constant_1 = require("./book.constant");
const createBook = (book, bookCover, listedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const { author, title, publishedDate, genre } = book;
    if (!author || !title || !listedBy || !publishedDate || !genre)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'All fields are required');
    if (!bookCover)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide a cover photo');
    const bookCoverUrl = yield cloudinaryHelper_1.cloudinaryHelper.uploadToCloudinary(bookCover, 'comic-verse/book-cover');
    book.bookCover = bookCoverUrl;
    book.listedBy = listedBy;
    const result = yield book_model_1.Book.create(book);
    return result;
});
const getAllBooks = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelpers_1.paginationHelpers.calculatePagination(paginationOptions);
    const sortConditions = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }
    const { searchTerm, year } = filters, filtersData = __rest(filters, ["searchTerm", "year"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: book_constant_1.bookSearchableFields.map(field => ({
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
    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = yield book_model_1.Book.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);
    const total = yield book_model_1.Book.countDocuments();
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleBook = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield book_model_1.Book.findById(id).populate('reviews.reviewer', 'name');
    return result;
});
const updateBook = (id, payload, bookCover) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield book_model_1.Book.findById(id);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Could not find the book');
    if (bookCover) {
        const imagePublicId = book.bookCover.publicId;
        yield cloudinaryHelper_1.cloudinaryHelper.deleteFromCloudinary(imagePublicId);
        payload.bookCover = yield cloudinaryHelper_1.cloudinaryHelper.uploadToCloudinary(bookCover, 'comic-verse/book-cover');
    }
    const result = yield book_model_1.Book.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteBook = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield book_model_1.Book.findById(id);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Could not find the book');
    const imagePublicId = book.bookCover.publicId;
    yield cloudinaryHelper_1.cloudinaryHelper.deleteFromCloudinary(imagePublicId);
    const result = yield book_model_1.Book.findByIdAndDelete(id);
    return result;
});
const postReview = (bookId, payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield book_model_1.Book.findById(bookId);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Could not find the book');
    const query = {
        _id: bookId,
        'reviews.reviewer': id,
    };
    const updatedReview = {
        $set: {
            'reviews.$.review': payload.review,
        },
    };
    const existingReview = yield book_model_1.Book.findOneAndUpdate(query, updatedReview, {
        new: true,
        select: { title: 1, reviews: 1 },
    }).populate('reviews.reviewer', 'name avatar.photoUrl ');
    if (!existingReview) {
        payload.reviewer = new mongoose_1.Types.ObjectId(id);
        const review = {
            $push: {
                reviews: payload,
            },
        };
        const result = yield book_model_1.Book.findByIdAndUpdate(bookId, review, {
            new: true,
            select: { title: 1, reviews: 1 },
        }).populate('reviews.reviewer', 'name avatar.photoUrl ');
        return result;
    }
    return existingReview;
});
const deleteReview = (bookId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield book_model_1.Book.findById(bookId);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Could not find the book');
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
    const updatedBook = yield book_model_1.Book.findOneAndUpdate(query, update, options).populate('reviews.reviewer', 'name avatar.photoUrl');
    return updatedBook;
});
exports.BookService = {
    createBook,
    getAllBooks,
    updateBook,
    deleteBook,
    getSingleBook,
    postReview,
    deleteReview,
};
