import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'facebook-posts',   // organizes images in a folder
        format: 'png',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(new Error("Cloudinary upload failed: " + error.message));
        else resolve(result);
      }
    );

    uploadStream.end(buffer); // pipe buffer into the stream
  });
};