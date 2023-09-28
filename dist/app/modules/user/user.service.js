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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelper_1 = require("../../../jwt/jwtHelper");
const config_1 = __importDefault(require("../../../config"));
const cloudinaryHelper_1 = require("../../../cloudinary/cloudinaryHelper");
const mongoose_1 = require("mongoose");
const book_model_1 = require("../book/book.model");
const createUser = (user, avatar) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = user;
    if (!email || !password || !name)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'All fields are required');
    const userExist = yield user_model_1.User.findOne({ email });
    if (userExist)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already exist');
    let avatarUrl = null;
    if (avatar)
        avatarUrl = yield cloudinaryHelper_1.cloudinaryHelper.uploadToCloudinary(avatar, 'comic-verse/avatars');
    user.avatar = avatarUrl;
    const result = yield user_model_1.User.create(user);
    const sanitizedResult = yield user_model_1.User.findById(result._id)
        .select('-password')
        .lean();
    return sanitizedResult;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email: givenEmail, password } = payload;
    const user = new user_model_1.User();
    const isUserExist = yield user.isUserExist(givenEmail);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (isUserExist.password &&
        !(yield user.isPasswordMatched(password, isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, ' Password is incorrect');
    }
    // create access token , refresh token
    const { _id, email } = isUserExist;
    const accessToken = jwtHelper_1.jwtHelpers.createToken({ _id, email }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelper_1.jwtHelpers.createToken({ _id, email }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid refresh token');
    }
    // checking deleted user refresh  token
    const { _id } = verifiedToken;
    const isUserExist = yield user_model_1.User.findById(_id, { _id: 1, email: 1 });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // generate new user refresh token
    const newAccesstoken = jwtHelper_1.jwtHelpers.createToken({
        _id: isUserExist._id,
        email: isUserExist.email,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        accessToken: newAccesstoken,
    };
});
const addToWishlist = (bookId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const book = yield book_model_1.Book.findById(bookId);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Couln't find book");
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    const bookObjectId = new mongoose_1.Types.ObjectId(bookId);
    if ((_a = user.wishlist) === null || _a === void 0 ? void 0 : _a.includes(bookObjectId)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Book is already in your wishlist');
    }
    const wish = {
        $push: {
            wishlist: bookId,
        },
    };
    const result = yield user_model_1.User.findByIdAndUpdate(userId, wish, { new: true })
        .select('-password')
        .populate('wishlist');
    return result;
});
const getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(userId, {
        wishlist: 1,
        avatar: 1,
        email: 1,
    }).populate('wishlist', 'bookCover title author');
    return result;
});
const deleteFromWishlist = (bookId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const book = yield book_model_1.Book.findById(bookId);
    if (!book)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Couln't find book");
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    const bookObjectId = new mongoose_1.Types.ObjectId(bookId);
    let result = null;
    if ((_b = user.wishlist) === null || _b === void 0 ? void 0 : _b.includes(bookObjectId)) {
        const wish = {
            $pull: {
                wishlist: bookId,
            },
        };
        result = yield user_model_1.User.findByIdAndUpdate(userId, wish, { new: true })
            .select('-password')
            .populate('wishlist');
    }
    return result;
});
exports.UserService = {
    createUser,
    loginUser,
    refreshToken,
    addToWishlist,
    deleteFromWishlist,
    getProfile,
};
