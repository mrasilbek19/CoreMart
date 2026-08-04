import express from "express";
import shopController from "./controllers/shop.controller";
const routerAdmin = express.Router();

routerAdmin.get("/", shopController.goHome);

routerAdmin.post("/signup", shopController.processSignup);


export default routerAdmin;