"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const mongoose_1 = require("mongoose");
const BookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    bookCover: {
        publicId: {
            type: String,
            required: true,
        },
        photoUrl: {
            type: String,
            required: true,
        },
    },
    // imageUrl: {
    //   type: String,
    // },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    listedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    publishedDate: {
        type: Date,
        required: true,
    },
    reviews: [
        {
            review: {
                type: String,
                required: true,
            },
            reviewer: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
}, {
    timestamps: true,
});
exports.Book = (0, mongoose_1.model)('Book', BookSchema);
