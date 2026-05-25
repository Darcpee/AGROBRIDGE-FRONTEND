const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const dotenv = require("dotenv");
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "AgroBridge-frontend", // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
