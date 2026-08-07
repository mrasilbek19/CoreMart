import express from "express";
import shopController from "./controllers/shop.controller";
import makeUploader from "./libs/utils/uploader";
const routerAdmin = express.Router();

routerAdmin.get("/", shopController.goHome);
routerAdmin
    .get("/login", shopController.getLogin)
    .post("/login", shopController.processLogin);

routerAdmin
    .get("/signup", shopController.getSignup)
    .post(
        "/signup",
        makeUploader("members").single("memberImage"),
        shopController.processSignup);


export default routerAdmin;