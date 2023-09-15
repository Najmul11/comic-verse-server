/* eslint-disable no-undef */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const uploadToCloudinary = async (
  avatar: Express.Multer.File | undefined,
  folder: string,
) => {
  try {
    const unlinkAsync = promisify(fs.unlink);

    let uploadedImageInfo = null;

    if (avatar) {
      // Create a temporary file from the Buffer
      const fileExtension = path.extname(avatar.originalname);
      const tempFilePath = `temp-avatar-${Date.now()}${fileExtension}`;
      fs.writeFileSync(tempFilePath, avatar.buffer);

      // Upload the temporary file to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: folder,
      });

      uploadedImageInfo = {
        publicId: result.public_id,
        photoUrl: result.secure_url,
      };

      // Delete the temporary file
      await unlinkAsync(tempFilePath);
    }

    return uploadedImageInfo;
  } catch (error) {
    throw new Error('Error uploading avatar to Cloudinary');
  }
};

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Error uploading avatar to Cloudinary');
  }
};

export const cloudinaryHelper = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
