import express from "express";
import restaurantController from "./controllers/member.controller";
const routerAdmin = express.Router();

routerAdmin.get("/", restaurantController.goHome);


export default routerAdmin;