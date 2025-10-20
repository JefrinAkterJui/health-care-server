import multer from "multer"
import path from "path"
import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'; 
import config from "../../config"; 


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) 
  }
})

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path,
      (error, result) => {
        fs.unlinkSync(file.path); 
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const fileUploder={
  upload,
  uploadToCloudinary 
}