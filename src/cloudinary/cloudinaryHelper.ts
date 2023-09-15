/* eslint-disable no-undef */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const cloudinaryHelper = async (
  avatar: Express.Multer.File | undefined,
  folder: string,
) => {
  try {
    const unlinkAsync = promisify(fs.unlink);

    let imageURI: string = '';

    if (avatar) {
      // Create a temporary file from the Buffer
      const fileExtension = path.extname(avatar.originalname);
      const tempFilePath = `temp-avatar-${Date.now()}${fileExtension}`;
      fs.writeFileSync(tempFilePath, avatar.buffer);

      // Upload the temporary file to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: folder,
      });
      imageURI = result.secure_url;

      // Delete the temporary file
      await unlinkAsync(tempFilePath);
    }

    return imageURI;
  } catch (error) {
    throw new Error('Error uploading avatar to Cloudinary');
  }
};

export default cloudinaryHelper;
