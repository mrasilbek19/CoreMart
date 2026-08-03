import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";


const restaurantController: T = {};


restaurantController.goHome = (req: Request, res: Response) => {
    try {
        console.log("Home page")
        res.render("home");
    } catch (err) {
        console.log("Error, goHome:", err);
        res.redirect("/admin")
    }
}


export default restaurantController;
