import express from "express";
import shopController from "./controllers/shop.controller";
const routerAdmin = express.Router();

routerAdmin.get("/", shopController.goHome);


export default routerAdmin;