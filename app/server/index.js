 const express = require("express");
 const morgan = require("morgan");
 const router = require("../../config/routes");
 const cors = require('cors');
 
 const app = express();

 const whitelist = ['http://localhost:8000'] //tambahin nnti web ny pas udah dideploy
 var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1|| !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials:true,
      optionSuccessStatus:200
 }
 
 app.set("trust proxy", 1);
 app.use(cors(corsOptions));

 /** Install request logger */
 app.use(morgan("dev"));
 
 /** Install JSON request parser */
 app.use(express.urlencoded({ extended: true }))
 app.use(express.json());
 
 /** Install Router */
 app.use(router);
 
 module.exports = app;
 