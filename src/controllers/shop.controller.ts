import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { MemberType } from "../libs/enums/member.enum";
import { AdminRequest, LoginInput, MemberInput, MemberUpdateInput } from "../libs/types/member";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/Errors";


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

shopController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin page")
        res.render("login");
    } catch (err) {
        console.log("Error, getLogin:", err);
        res.redirect("/admin")
    }
};

shopController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignup page")
        const file = req.file;
        if (!file)
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG)

        const newMember: MemberInput = req.body
        newMember.memberImage = file?.path.replace(/\\/g, "/");
        newMember.memberType = MemberType.SHOP;
        const result = await memberService.processSignup(newMember)

        req.session.member = result;
        req.session.save(function () {
            res.redirect("/admin/product/all");
        })

    } catch (err) {
        console.log("Error, processSignup:", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup')</script>`)
    }
};

shopController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");
        console.log(req.body);
        const memberInput: LoginInput = req.body
        const result = await memberService.processLogin(memberInput)

        req.session.member = result;
        req.session.save(function () {
            res.redirect("/admin/"); // consider later
        })
    } catch (err) {
        console.log("Error, processLogin:", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup')</script>`)
    }
}

shopController.getUsers = async (req: Request, res: Response) => {
    try {
        console.log("getUsers")

        const result = await memberService.getUsers();

        res.render("users", { users: result });

    } catch (err) {
        console.log("Error, getUsers:", err);
        res.redirect("/admin/login")
    }
}



export default shopController;
