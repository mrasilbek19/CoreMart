import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";


const shopController: T = {};


shopController.goHome = (req: Request, res: Response) => {
    try {
        console.log("Home page")
        res.render("home");
    } catch (err) {
        console.log("Error, goHome:", err);
        res.redirect("/admin")
    }
}


export default shopController;
