const express = require("express");
const controllers = require("../app/controllers");
const uploadOnMemory = require("../app/middleware/uploadOnMemory");

const apiRouter = express.Router();

apiRouter.get("/",controllers.api.v1.tesController.tes);
apiRouter.get("/api/v1/all-kategori",controllers.api.v1.jenisController.getAllKategori);
apiRouter.get('/api/v1/all-item',controllers.api.v1.jenisController.getAllItem);
apiRouter.get("/api/v1/all-setup",controllers.api.v1.setupController.getAllSetup);
apiRouter.get("/api/v1/setup/:id",controllers.api.v1.setupController.getSetupById);
apiRouter.post('/api/v1/upload-setup-photo', uploadOnMemory.single("picture"),controllers.api.v1.setupController.uploadSetupPhoto); //satu photo
apiRouter.delete('/api/v1/delete-setup-photo',controllers.api.v1.setupController.deleteSetupPhoto);//satu photo
apiRouter.post('/api/v1/create-setup',controllers.api.v1.setupController.createSetup);
apiRouter.post('/api/v1/like-setup',controllers.api.v1.setupController.likeSetup);

apiRouter.use(controllers.api.main.onLost);
apiRouter.use(controllers.api.main.onError);

module.exports = apiRouter;