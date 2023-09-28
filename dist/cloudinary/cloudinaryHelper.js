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
exports.cloudinaryHelper = void 0;
/* eslint-disable no-undef */
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const uploadToCloudinary = (avatar, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
        let uploadedImageInfo = null;
        if (avatar) {
            // Create a temporary file from the Buffer
            const fileExtension = path_1.default.extname(avatar.originalname);
            const tempFilePath = `temp-avatar-${Date.now()}${fileExtension}`;
            fs_1.default.writeFileSync(tempFilePath, avatar.buffer);
            // Upload the temporary file to Cloudinary
            const result = yield cloudinary_1.v2.uploader.upload(tempFilePath, {
                folder: folder,
            });
            uploadedImageInfo = {
                publicId: result.public_id,
                photoUrl: result.secure_url,
            };
            // Delete the temporary file
            yield unlinkAsync(tempFilePath);
        }
        return uploadedImageInfo;
    }
    catch (error) {
        throw new Error('Error uploading avatar to Cloudinary');
    }
});
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        throw new Error('Error uploading avatar to Cloudinary');
    }
});
exports.cloudinaryHelper = {
    uploadToCloudinary,
    deleteFromCloudinary,
};
