 const express = require("express");
 const morgan = require("morgan");
 const dotenv = require('dotenv');
 const router = require("../../config/routes");
 
 dotenv.config();
 const app = express();
 
 /** Install request logger */
 app.use(morgan("dev"));
 
 /** Install JSON request parser */
 app.use(express.urlencoded({ extended: true }))
 app.use(express.json());
 
 /** Install Router */
 app.use(router);
 
 module.exports = app;
 