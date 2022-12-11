// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CL_NAME, // TODO: Ganti dengan cloudname-mu
  api_key: process.env.CL_KEY, // TODO: Ganti dengan API Key-mu
  api_secret: process.env.CL_SECRET, // TODO: Ganti dengan API Secret-mu
  secure: true,
});

module.exports = cloudinary;