import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { MemberType } from "../libs/enums/member.enum";
import { MemberInput } from "../libs/types/member";
import MemberService from "../models/Member.service";
import Errors, { Message } from "../libs/Errors";


const memberService = new MemberService();
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

shopController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup page")
        res.render("signup");
    } catch (err) {
        console.log("Error, getSignup:", err);
        res.redirect("/admin")
    }
};

shopController.processSignup = async (req: Request, res: Response) => {
    try {
        console.log("processSignup page")
        console.log(req.body);
        const newMember: MemberInput = req.body
        newMember.memberType = MemberType.SHOP
        console.log(newMember);
        const result = await memberService.processSignup(newMember);

        res.json(result);

    } catch (err) {
        console.log("Error, processSignup:", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup')</script>`)
    }
};



export default shopController;
