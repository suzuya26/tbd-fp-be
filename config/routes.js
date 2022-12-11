const express = require("express");
const controllers = require("../app/controllers");
const uploadOnMemory = require("../app/middleware/uploadOnMemory");

const apiRouter = express.Router();

apiRouter.get("/",controllers.api.v1.tesController.tes);
apiRouter.get("/all-setup",controllers.api.v1.setupController.getAllSetup);
apiRouter.get("/setup/:id",controllers.api.v1.setupController.getSetupById);
apiRouter.post('/upload-setup-photo', uploadOnMemory.single("picture"),controllers.api.v1.setupController.uploadSetupPhoto); //satu photo
apiRouter.delete('/delete-setup-photo',controllers.api.v1.setupController.deleteSetupPhoto);//satu photo
apiRouter.post('/create-setup',controllers.api.v1.setupController.createSetup);

apiRouter.use(controllers.api.main.onLost);
apiRouter.use(controllers.api.main.onError);

module.exports = apiRouter;