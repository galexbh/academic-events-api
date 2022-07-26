import { v2 as cloudinary } from "cloudinary";
import config from "config";

const cloud_name = config.get<string>("cloud_name");
const api_key = config.get<string>("api_key");
const api_secret = config.get<string>("api_secret");

cloudinary.config({ cloud_name, api_key, api_secret, secure: true });

export async function uploadImage(filePath: string) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "academic",
  });
}

export async function deleteImage(publicId: string) {
  return await cloudinary.uploader.destroy(publicId);
}
