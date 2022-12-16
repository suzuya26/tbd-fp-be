 const express = require("express");
 const morgan = require("morgan");
 const router = require("../../config/routes");
 const cors = require('cors');
 
 const app = express();

 const whitelist = ['http://localhost:8000','https://tbd-fp-kelompok-3.cyclic.app','http://localhost:5713','http://localhost:3000'] //tambahin nnti web ny pas udah dideploy
 var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1|| !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials:true,
      optionSuccessStatus:200,
      methods :['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept','x-client-key', 'x-client-token', 'x-client-secret'],
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

 const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})

 module.exports = app;
 